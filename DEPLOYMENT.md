# Publish putujsam.com on Namecheap

This guide is for Namecheap shared hosting with cPanel and a domain registered
at Dynadot. The website is static: no Node server, database, or WordPress is
needed on the hosting account.

For your current account, DNS and SSL are already working and the upload
folder is **`/putujsam.com`**. Start with step 3; steps 1–2 are reference
instructions if those settings change later.

## 1. Connect the domain at Dynadot

In **My Domains → Manage Domains**, select `putujsam.com`, then choose
**Action → DNS Settings → Name Servers**. Enter these two servers and save:

```text
dns1.namecheaphosting.com
dns2.namecheaphosting.com
```

The domain remains registered at Dynadot; DNS will be managed in Namecheap's
cPanel. These instructions assume there are no existing website or email
services to preserve. Nameserver changes may take up to 24–48 hours to propagate.

Sources: [Dynadot nameserver instructions](https://www.dynadot.com/help/question/set-name-servers)
and [Namecheap shared hosting setup](https://www.namecheap.com/support/knowledgebase/article.aspx/177/27/shared-hosting-getting-started/).

## 2. Check the domain in cPanel

Your cPanel screenshot confirms that `putujsam.com` is already added and its
document root is **`/putujsam.com`**, relative to your hosting account's home
folder. Click that folder link in the Domains table to open File Manager.

In Namecheap, open **Hosting List → Go to cPanel → Domains**.

- If `putujsam.com` is listed, use its **Document Root** folder.
- If it is missing, choose **Create A New Domain**, enter `putujsam.com`, and
  give it its own document root if the account already hosts another domain.
  Uncheck **Share document root** if that option appears. Submit, then note the
  new document root. If domain validation fails immediately after changing
  nameservers, allow time for DNS to update and retry.

The primary domain usually uses `public_html`. An additional domain may use
a different folder; the value shown in **Domains** is the one to use.

Source: [Namecheap addon domain instructions](https://www.namecheap.com/support/knowledgebase/article.aspx/897/29/how-to-create-an-addon-domain/).

## 3. Build and upload

For the initial upload, use the prepared `deploy/putujsam-namecheap.zip`.
To rebuild it after future edits:

```sh
npm run package:namecheap
```

In cPanel:

1. Open **File Manager** and navigate to the document root from step 2.
2. Choose **Settings → Show Hidden Files (dotfiles)** so `.htaccess` is visible.
3. Upload `putujsam-namecheap.zip`, select it, and choose **Extract** into the
   current folder.
4. Confirm `index.html`, `.htaccess`, `404.html`, `assets/`, `images/`, and
   `destinacije/` are directly in the document root. There is no `dist/` wrapper.
5. If the root had a default `index.php` or an existing `.htaccess`, back it up
   before replacing it. Use the `.htaccess` supplied with this website.
6. Remove the uploaded ZIP after extracting it.

The archive contains only built public files. Keep the destination `.html`
files and `.htaccess`: they make direct links such as `/destinacije/tara` work
and preserve each page's search metadata. No installation or build command
is needed inside cPanel.

Source: [Namecheap website upload instructions](https://www.namecheap.com/support/knowledgebase/article/181/27/how-do-i-upload-my-site/).

## 4. Check HTTPS

At preparation time, public checks confirmed that `putujsam.com` already uses
Namecheap's hosting nameservers, HTTPS works for both the main domain and
`www`, and HTTP redirects to HTTPS. You do not need to change nameservers or
activate a new certificate for this upload.

Once DNS resolves to Namecheap, open **Namecheap SSL** in cPanel and check that
an SSL certificate is installed and active for **both `putujsam.com` and
`www.putujsam.com`**. Complete certificate installation if it is still pending.
The `.htaccess` keeps validation files accessible.

The supplied `.htaccess` redirects HTTP and `www` visits to
`https://putujsam.com`, preserving the page path and query. This works even if
your addon domain does not show a **Force HTTPS Redirect** switch in cPanel.
After uploading, verify that `https://putujsam.com` opens without a certificate
warning. These redirects require a valid certificate for both hostnames.

Source: [Namecheap SSL plugin instructions](https://www.namecheap.com/support/knowledgebase/article.aspx/9387/2218/what-is-namecheap-ssl-and-how-do-i-use-it/).

## 5. Verify the live website

Check all of these after DNS and SSL are ready:

- `https://putujsam.com/` — homepage, photos, and interactive map.
- `https://putujsam.com/destinacije/tara` — opens directly and survives refresh.
- `https://putujsam.com/smestaj` — accommodation inquiry links.
- `https://putujsam.com/sitemap.xml` and `/robots.txt` — accessible.
- `https://putujsam.com/this-page-does-not-exist` — the site's error page with
  an HTTP **404** status (check the browser's Network tab).
- `https://putujsam.com/destinacije/tara.html` — redirects to the clean URL.
- `https://www.putujsam.com/destinacije/tara` — redirects to the same page on
  `putujsam.com`.
- `http://putujsam.com` — redirects to HTTPS.

The current homepage is the map layout, with the second design at
`/inspiracija`. Existing site/domain sale notices and contact details are
included in the published build.

After launch, verify `putujsam.com` in Google Search Console and submit
`https://putujsam.com/sitemap.xml`.
