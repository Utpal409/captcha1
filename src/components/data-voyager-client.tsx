'use client';

import { useActionState, useState, useEffect } from 'react';
import { fetchAndExtract, sendToDropbox, type ActionState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Search,
  Globe,
  UploadCloud,
} from 'lucide-react';
import Image from 'next/image';


const initialState: ActionState = {};

export function DataVoyagerClient() {
  const [state, formAction, isPending] = useActionState(
    fetchAndExtract,
    initialState
  );
  const [captchaImage, setCaptchaImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
    if (state.data?.captcha) {
      setCaptchaImage(`data:image/jpeg;base64,${state.data.captcha}`);
      toast({
        title: 'Success',
        description: 'Captcha fetched.',
      });
    }
    if (state.dropboxSuccess) {
      toast({
        title: 'Dropbox Upload Successful',
        description: state.dropboxSuccess,
      });
    }
  }, [state, toast]);

  const handleSendToDropbox = async () => {
    if (!captchaImage) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No captcha image to upload.',
      });
      return;
    }
    setIsUploading(true);
    const result = await sendToDropbox(captchaImage);
    setIsUploading(false);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Dropbox Upload Error',
        description: result.error,
      });
    } else if (result.dropboxSuccess) {
      toast({
        title: 'Dropbox Upload Successful',
        description: result.dropboxSuccess,
      });
    }
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
                Click the button to fetch content from the permanent URL.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
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

      {(isPending || captchaImage) && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Fetched Captcha</CardTitle>
              <CardDescription>
                The captcha image from the provided URL.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isPending && !captchaImage ? (
              <div className="h-[100px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
             captchaImage && (
                <div className="flex flex-col items-center gap-4">
                  <div className="mt-4 rounded-md border bg-muted/50 p-4 flex justify-center">
                     <Image
                        src={captchaImage}
                        alt="Fetched Captcha"
                        width={200}
                        height={70}
                        className="rounded-md"
                      />
                  </div>
                  <Button onClick={handleSendToDropbox} disabled={isUploading} className="min-w-[180px]">
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Send to Dropbox
                      </>
                    )}
                  </Button>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
