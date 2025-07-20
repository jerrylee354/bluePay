
## Create Project Archive

Copy and paste the following command into the terminal to create a zip file of your project named `bluepay-mvp-source.zip`. The zip file will appear in the root directory.

```bash
zip -r ./bluepay-mvp-source.zip . -x "node_modules/*" -x ".next/*" -x ".git/*" -x "bluepay-mvp-source.zip"
```

---

# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
