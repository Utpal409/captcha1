'use client';

import { useActionState, useState, useEffect } from 'react';
import { fetchAndExtract, type ActionState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Search,
  Copy,
  FileText,
  FileCode,
  Braces,
  Globe,
} from 'lucide-react';

const initialState: ActionState = {};

export function DataVoyagerClient() {
  const [state, formAction, isPending] = useActionState(
    fetchAndExtract,
    initialState
  );
  const [displayFormat, setDisplayFormat] = useState('text');
  const [content, setContent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
    if (state.data) {
      const { content: newContent, format } = state.data;
      setDisplayFormat(format);
      if (format === 'json') {
        try {
          setContent(JSON.stringify(JSON.parse(newContent), null, 2));
        } catch {
          setContent(newContent);
        }
      } else {
        setContent(newContent);
      }
      toast({
        title: 'Success',
        description: 'Data fetched.',
      });
    }
  }, [state, toast]);

  const handleCopy = (text: string, subject: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: 'Copied to clipboard',
          description: `${subject} has been copied.`,
        });
      })
      .catch((err) => {
        toast({
          variant: 'destructive',
          title: 'Failed to copy',
          description: 'Could not copy to clipboard.',
        });
      });
  };

  return (
    <div className="flex flex-col gap-8">
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-primary p-3 rounded-md">
              <Globe className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-3xl font-headline">
                DataVoyager
              </CardTitle>
              <CardDescription>
                Paste a URL to fetch its content.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex gap-2">
            <Input
              name="url"
              type="url"
              placeholder="https://example.com"
              required
              className="text-base"
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending} className="min-w-[120px]">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Fetch
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {(isPending || state.data) && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Fetched Content</CardTitle>
                <CardDescription>
                  The data from the provided URL.
                </CardDescription>
              </div>
              {state.data && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(content, 'Content')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isPending && !state.data ? (
              <div className="h-[500px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Tabs value={displayFormat} onValueChange={setDisplayFormat}>
                <TabsList>
                  <TabsTrigger value="html">
                    <FileCode className="mr-2" />
                    HTML
                  </TabsTrigger>
                  <TabsTrigger value="json">
                    <Braces className="mr-2" />
                    JSON
                  </TabsTrigger>
                  <TabsTrigger value="text">
                    <FileText className="mr-2" />
                    Text
                  </TabsTrigger>
                </TabsList>
                <div className="mt-4 rounded-md border bg-muted/50">
                  <ScrollArea className="h-[500px] w-full">
                    <pre className="p-4 text-sm whitespace-pre-wrap break-all">
                      <code className={`language-${displayFormat}`}>
                        {content}
                      </code>
                    </pre>
                  </ScrollArea>
                </div>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
