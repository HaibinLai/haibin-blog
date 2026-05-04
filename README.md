# Haibin Blog Vercel Proxy

This is a minimal Vercel reverse proxy for the WordPress blog at:

https://www.haibinlaiblog.top/

## How it works

`vercel.json` sends every request to `api/proxy.js`. The proxy fetches the WordPress origin and rewrites absolute origin links in text responses so CSS, JavaScript, images, and WordPress routes keep going through the Vercel domain:

```text
https://your-vercel-domain.com/some/path
-> https://www.haibinlaiblog.top/some/path
```

## Deploy

1. Import this repository in Vercel.
2. Keep the default project settings.
3. Deploy.

After deployment, visiting the Vercel domain should show the WordPress blog through Vercel.

## Notes

This proxy rewrites common absolute links and redirects, but WordPress admin login, cookies, and some plugin-generated URLs may still need domain-aware WordPress settings if the Vercel domain becomes the main production address.
