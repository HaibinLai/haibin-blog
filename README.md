# Haibin Blog Vercel Proxy

This is a minimal Vercel reverse proxy for the WordPress blog at:

https://www.haibinlaiblog.top/

## How it works

`vercel.json` rewrites every request path to the WordPress origin:

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

WordPress may still output absolute links, redirects, cookies, or admin URLs that point to the original domain. If this proxy becomes the main production domain, also update the WordPress `home` and `siteurl` settings or configure domain handling on the WordPress side.
