import os
import requests

def run():
  url = os.getenv("INPUT_URL")
  delay = os.getenv("INPUT_DELAY_INTERVAL", "5")
  max_retries = os.getenv("INPUT_MAX_RETRIES", "10")

  website_reachable = ping_url(url, delay, max_retries)
  if not website_reachable:
    raise Exception(f"Failed to ping {url} after {max_retries} attempts.")
  
  print(f"Successfully pinged {url} after {max_retries} attempts.")
  exit(0)

def ping_url(url, delay, max_retries):
  trials = 0
  while trials < int(max_retries):
    try:
      response = requests.get(url)
      if response.status_code == 200:
        print(f"Successfully pinged {url}")
        return True
      else:
        print(f"Received status code {response.status_code} from {url}")
    except requests.ConnectionError as e:
      print(f"Error pinging {url}: {e}. Retrying in {delay} seconds...")
      time.sleep(int(delay))
      trials += 1
    except requests.exceptions.MissingSchema as e:
      print(f"Invalid URL {url}: {e}")
      print("Please provide a valid URL (e.g., https://www.google.com)")
      return False
  return False

if __name__ == "__main__":
  run()