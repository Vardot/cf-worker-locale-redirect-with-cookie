# Cloudflare Worker: Geo (Country) Redirects and Cookie Handling
This Cloudflare Worker is designed to handle locale-based redirects for website visitors based on their requests' country, as determined by the `request.cf.country` header. The worker also sets a cookie to store the user's preferred language, allowing for faster and more personalized experiences on subsequent visits. Additionally, users can force a locale update through a query string parameter.

This is the current Cloudflare Worker responsible for managing the https://www.vardot.com multi-locale redirects.

## Features
- Redirects users based on their country code to the appropriate URL with a locale prefix.
- Sets a cookie with the user's locale to improve user experience on subsequent visits.
- Allows users to force a locale update using a query string parameter.
- Excludes certain user agents, such as crawlers and bots, from redirection and cookie handling.
- Checks if the requested URL is eligible for redirection (e.g., excluding images and non-HTML content).

## Usage
### Enable the Worker on Cloudflare
1. Log in to your Cloudflare account and select the domain you want to use the worker with.
2. Click on the "Workers Routes" tab in the dashboard, then click on "Manager Workers" button.
3. Create a new worker by clicking on the "Create a Service" button.
4. Name your Service something like `redirectlocale`.
5. Go to "Quick edit" and copy and paste the worker script from this repository into the "Script" section of the worker editor.
6. Update the variables as needed. See "Customizations" below.
7. Click "Save and Deploy" to deploy the worker.
8. Navigate to "Triggers" in the "Service" page, then add a route for your domain, such as `www.vardot.com/*` with the Zone the domain is on.
9. Save the route, and your worker is now enabled for the specified domain.

For more information on Cloudflare Workers, please refer to the official documentation (https://developers.cloudflare.com/workers/).

### Examples
Suppose your website supports the following locales: English (US), English (UK), and Arabic (SA). You can configure the `countryLocaleMap` object like this:
```
const countryLocaleMap = {
  US: 'en-us',
  GB: 'en-gb',
  SA: 'ar-sa',
};
```

When a user from the United States visits your website, they will be redirected to the URL with the `en-us` locale prefix. If the user is from the United Kingdom, they will be redirected to the `en-gb` version of the site, and users from Saudi Arabia will be redirected to the `ar-sa` version.

The user's locale is stored in a cookie, so on their next visit, they will be served the appropriate localized content without checking for the country again. If the user wants to switch to a different locale, they can add a `update_hl` query parameter to the URL, like `https://www.vardot.com/?update_hl=en-gb`, to update their locale preference and be redirected to the new locale.

## Customization
You can customize this worker to suit your specific needs by modifying the following:

1. Update the `countryLocaleMap` object to match your desired country-to-locale mapping, along with the `defaultLocale` and `defaultCountry`, where the latter is used if Cloudflare did not include a country header for any reason.
2. Set the `cookieName`, `cookieAge`, `cookieQueryStringName` variables to your preferred cookie name for storing the user's locale. The `cookieQueryStringName` is used to any URL to force a locale. Example: https://www.vardot.com/about-us?`cookieQueryStringName`=en-us
3. Adjust the `userAgentExclusions` array to exclude additional user agents from redirection and cookie handling, if needed.
4. Modify the `isRedirectable` function to add any custom logic for determining whether a URL should be redirected. This is also useful to prevent redirects for static assets, which is the current use case.

Please note that this worker assumes that your website supports the locales specified in the `countryLocaleMap`. Ensure that your website is properly set up to handle these locales before deploying the worker.


## License
This project is licensed under the MIT License.

## Credits
- Mohammed Razem (m.razem@vardot.com)
