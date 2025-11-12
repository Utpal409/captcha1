'use server';

const URL_TO_FETCH = 'https://gateway-voters.eci.gov.in/api/v1/captcha-service/generateCaptcha/EROLL';

export interface ActionState {
  data?: {
    captcha: string;
  };
  error?: string;
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
