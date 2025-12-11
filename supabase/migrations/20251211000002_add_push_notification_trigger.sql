-- Create a function to call the Edge Function for push notifications
-- This uses pg_net extension to make HTTP calls from Postgres
CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
    edge_function_url TEXT;
    service_role_key TEXT;
    notification_title TEXT;
    notification_body TEXT;
    notification_data JSONB;
BEGIN
    -- Get the Edge Function URL from vault or use default
    -- You'll need to set this in your Supabase dashboard
    edge_function_url := current_setting('app.settings.edge_function_url', true);
    service_role_key := current_setting('app.settings.service_role_key', true);

    -- If settings aren't configured, skip
    IF edge_function_url IS NULL OR service_role_key IS NULL THEN
        RETURN NEW;
    END IF;

    -- Build notification content
    notification_title := NEW.title;
    notification_body := NEW.message;
    notification_data := jsonb_build_object(
        'notification_id', NEW.id::text,
        'notification_type', NEW.notification_type,
        'link_url', COALESCE(NEW.link_url, '')
    );

    -- Add related IDs to data if present
    IF NEW.related_property_id IS NOT NULL THEN
        notification_data := notification_data || jsonb_build_object('property_id', NEW.related_property_id::text);
    END IF;

    IF NEW.related_message_id IS NOT NULL THEN
        notification_data := notification_data || jsonb_build_object('message_id', NEW.related_message_id::text);
    END IF;

    IF NEW.related_match_id IS NOT NULL THEN
        notification_data := notification_data || jsonb_build_object('match_id', NEW.related_match_id::text);
    END IF;

    -- Call the Edge Function via pg_net (async HTTP call)
    -- This won't block the insert operation
    PERFORM net.http_post(
        url := edge_function_url || '/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
            'user_id', NEW.user_id::text,
            'title', notification_title,
            'body', notification_body,
            'data', notification_data
        )
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the insert
        RAISE WARNING 'Failed to trigger push notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on notifications table
-- This will fire AFTER a new notification is inserted
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;

CREATE TRIGGER on_notification_created
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION trigger_push_notification();

-- Also create a simple function to send push notifications manually
-- This can be called from Edge Functions or RPC
CREATE OR REPLACE FUNCTION send_push_notification(
    p_user_id UUID,
    p_title TEXT,
    p_body TEXT,
    p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN AS $$
DECLARE
    edge_function_url TEXT;
    service_role_key TEXT;
BEGIN
    edge_function_url := current_setting('app.settings.edge_function_url', true);
    service_role_key := current_setting('app.settings.service_role_key', true);

    IF edge_function_url IS NULL OR service_role_key IS NULL THEN
        RAISE WARNING 'Push notification settings not configured';
        RETURN FALSE;
    END IF;

    PERFORM net.http_post(
        url := edge_function_url || '/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
            'user_id', p_user_id::text,
            'title', p_title,
            'body', p_body,
            'data', p_data
        )
    );

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to send push notification: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
