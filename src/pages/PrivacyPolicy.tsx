import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/privacy-policy.md')
      .then((res) => res.text())
      .then((text) => setContent(text))
      .catch(() => setContent('# Privacy Policy\n\nLoading...'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="bg-white rounded-lg shadow-lg p-8 prose prose-sm md:prose-base max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
