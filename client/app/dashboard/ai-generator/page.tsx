'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import { aiService, templateService } from '@/lib/services';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Copy } from 'lucide-react';

export default function AIGeneratorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [generated, setGenerated] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const content = await aiService.generateContent(topic);
      setGenerated(content);
      toast({
        title: 'Success',
        description: 'Content generated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate content',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!generated.trim()) return;
    setIsSaving(true);
    try {
      await templateService.createTemplate({
        organizationId: user?.id || '',
        title: topic || 'Generated Template',
        content: generated,
      });
      toast({
        title: 'Success',
        description: 'Template saved successfully',
      });
      setTopic('');
      setGenerated('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generated);
    toast({
      title: 'Copied',
      description: 'Content copied to clipboard',
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-blue-600" />
          AI Content Generator
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Generate engaging social media content powered by AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input side */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            What should we post about?
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Topic or Keywords
              </label>
              <Input
                placeholder="e.g., sustainable farming, water conservation..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
            >
              {isGenerating ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Tips for better results
              </p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs">
                <li>• Be specific about your topic</li>
                <li>• Include relevant keywords</li>
                <li>• Think about your audience</li>
                <li>• Include location if relevant</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Output side */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Generated Content
          </h2>
          <div className="space-y-4">
            <Textarea
              value={generated}
              readOnly
              placeholder="Your generated content will appear here..."
              rows={6}
              className="bg-slate-50 dark:bg-slate-900 resize-none"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopy}
                disabled={!generated.trim()}
                className="flex-1"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveTemplate}
                disabled={isSaving || !generated.trim()}
              >
                {isSaving ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  'Save as Template'
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
