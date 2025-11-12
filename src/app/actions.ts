'use server';

const URL_TO_FETCH = 'https://gateway-voters.eci.gov.in/api/v1/captcha-service/generateCaptcha/EROLL';

export interface ActionState {
  data?: {
    captcha: string;
  };
  error?: string;
  dropboxSuccess?: string;
  logMessage?: string;
}

export async function fetchAndExtract(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const response = await fetch(URL_TO_FETCH, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return {
        error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data && data.captcha) {
        return {
            data: {
                captcha: data.captcha
            }
        }
    } else {
        return {
            error: "Could not find captcha in the response"
        }
    }

  } catch (e) {
    if (e instanceof TypeError && e.message.includes('fetch failed')) {
      return {
        error:
          'Network error or invalid URL. Please check the URL and your connection.',
      };
    }
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'An unknown error occurred while fetching the data.' };
  }
}

export async function sendToDropbox(captcha: string): Promise<ActionState> {
  const accessToken = process.env.DROPBOX_ACCESS_TOKEN;

  if (!accessToken) {
    return { error: 'Dropbox access token is not configured. Please set DROPBOX_ACCESS_TOKEN in your .env file.' };
  }
  
  if (!captcha) {
    return { error: 'No captcha image to upload.' };
  }

  try {
    const newFileName = `${Date.now()}.jpg`;
    const base64Data = captcha.replace(/^data:image\/jpeg;base64,/, "");

    const dropboxApiArg = {
      path: `/captcha/${newFileName}`,
      mode: 'add',
      autorename: false,
      mute: false,
    };

    const headers: HeadersInit = {
        'Authorization': `Bearer ${accessToken}`,
        'Dropbox-API-Arg': JSON.stringify(dropboxApiArg),
        'Content-Type': 'application/octet-stream',
    };

    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: headers,
      body: Buffer.from(base64Data, 'base64'),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Dropbox API Error (upload):', errorBody);
      return { error: `Failed to upload to Dropbox: ${response.status} ${response.statusText}. Response: ${errorBody}` };
    }

    const responseData = await response.json();
    return { dropboxSuccess: `Image uploaded successfully to Dropbox as ${responseData.path_display}` };

  } catch (e) {
    if (e instanceof Error) {
        console.error('Error in sendToDropbox:', e);
        return { error: e.message };
    }
    return { error: 'An unknown error occurred while uploading to Dropbox.' };
  }
}

export async function fetchAndSend(): Promise<ActionState> {
  const fetchResult = await fetchAndExtract(
    {},
    new FormData()
  );

  if (fetchResult.error || !fetchResult.data?.captcha) {
    return { error: fetchResult.error || 'Failed to fetch captcha.', logMessage: `[${new Date().toLocaleTimeString()}] Fetch failed: ${fetchResult.error || 'No captcha data'}` };
  }
  
  const captchaWithPrefix = `data:image/jpeg;base64,${fetchResult.data.captcha}`;
  
  const sendResult = await sendToDropbox(captchaWithPrefix);

  if (sendResult.error) {
     return { error: sendResult.error, logMessage: `[${new Date().toLocaleTimeString()}] Upload failed: ${sendResult.error}` };
  }

  return { dropboxSuccess: sendResult.dropboxSuccess, logMessage: `[${new Date().toLocaleTimeString()}] ${sendResult.dropboxSuccess}` };
}
