# रिलीज़ प्रबंधन {#release-management}

## संस्करणिंग (सेमांटिक संस्करणिंग) {#versioning-semantic-versioning}

प्रोजेक्ट सेमांटिक संस्करणिंग (सेमवर) का पालन करता है, जो इस प्रारूप का उपयोग करता है `MAJOR.MINOR.PATCH`:

- **MAJOR** संस्करण (x.0.0): जब आप असंगत API परिवर्तन करते हैं
- **MINOR** संस्करण (0.x.0): जब आप पिछले संगत तरीके से कार्यक्षमता जोड़ते हैं
- **PATCH** संस्करण (0.0.x): जब आप पिछले संगत बग फिक्स करते हैं

## प्री-रिलीज़ चेकलिस्ट {#pre-release-checklist}

नया संस्करण रिलीज़ करने से पहले, सुनिश्चित करें कि आपने निम्नलिखित पूरा कर लिया है:

- [ ] सभी परिवर्तन कोमिट और `vMAJOR.MINOR.x` ब्रांच में पुश कर दिए गए हैं।
- [ ] संस्करण संख्या को `package.json` में अपडेट कर दी गई है (फाइल्स में सिंक्रनाइज़ करने के लिए `scripts/update-version.sh` का उपयोग करें)।
- [ ] सभी टेस्ट पास हो गए हैं (डेवल मोड, स्थानीय, डॉकर और पॉडमैन में)।
- [ ] `pnpm docker:up` के साथ एक डॉकर कंटेनर शुरू करें और `scripts/compare-versions.sh` चलाएं विकास वातावरण और डॉकर कंटेनर के बीच संस्करण की सुसंगति की पुष्टि करने के लिए (यह स्क्रिप्ट SQLite संस्करणों को प्रमुख संस्करण के अनुसार तुलना करती है (उदाहरण के लिए, 3.45.1 और 3.51.1 संगत माने जाते हैं), और Node, npm, और Duplistatus संस्करणों को बिल्कुल ठीक से तुलना करती है।
- [ ] दस्तावेज़ अप टू डेट हैं, स्क्रीनशॉट्स अपडेट करें (`pnpm take-screenshots` का उपयोग करें)
- [ ] रिलीज़ नोट्स `documentation/docs/release-notes/VERSION.md` में तैयार किए गए हैं।
- [ ] `scripts/generate-readme-from-intro.sh` चलाएं `README.md` को नए संस्करण और `documentation/docs/intro.md` से परिवर्तनों के साथ अपडेट करने के लिए। यह स्क्रिप्ट `README_dockerhub.md` और `RELEASE_NOTES_github_VERSION.md` को स्वचालित रूप से उत्पन्न भी करती है।

## रिलीज़ प्रक्रिया अवलोकन {#release-process-overview}

अनुशंसित रिलीज़ प्रक्रिया **GitHub पुल रिक्वेस्ट्स और रिलीज़ेस** का उपयोग करती है (नीचे देखें)। यह बेहतर दृश्यता, समीक्षा क्षमताएं प्रदान करता है, और स्वचालित रूप से डॉकर इमेज बिल्ड ट्रिगर करता है। कमांड-लाइन विधि एक विकल्प के रूप में उपलब्ध है।

## विधि 1: GitHub पुल रिक्वेस्ट और रिलीज़ (अनुशंसित) {#method-1-github-pull-request-and-release-recommended}

यह विधि पसंदीदा है क्योंकि यह बेहतर ट्रेसबिलिटी प्रदान करती है और स्वचालित रूप से डॉकर बिल्ड ट्रिगर करती है।

### कदम 1: पुल रिक्वेस्ट बनाएं {#step-1-create-pull-request}

1. GitHub पर [duplistatus रिपॉजिटरी](https://github.com/wsj-br/duplistatus) पर जाएं।
2. **"Pull requests"** टैब पर क्लिक करें।
3. **"New pull request"** पर क्लिक करें।
4. **base branch** को `master` और **compare branch** को `vMAJOR.MINOR.x` सेट करें।
5. परिवर्तन पूर्वावलोकन की समीक्षा करें ताकि यह सुनिश्चित हो सके कि सब कुछ सही लग रहा है।
6. **"Create pull request"** पर क्लिक करें।
7. एक वर्णनात्मक शीर्षक जोड़ें (उदाहरण के लिए, "Release v1.2.0") और परिवर्तनों का सारांश देने वाला विवरण।
8. फिर से **"Create pull request"** पर क्लिक करें।

### कदम 2: पुल रिक्वेस्ट मर्ज करें {#step-2-merge-the-pull-request}

पुल रिक्वेस्ट की समीक्षा के बाद:

1. अगर कोई संघर्ष नहीं है, हरे **"Merge pull request"** बटन पर क्लिक करें।
2. अपनी मर्ज स्ट्रैटेजी चुनें (सामान्यत: "Create a merge commit")।
3. मर्ज की पुष्टि करें।

### कदम 3: GitHub रिलीज़ बनाएं {#step-3-create-github-release}

एक बार मर्ज पूरा हो जाने के बाद, एक GitHub रिलीज़ बनाएं:

1. GitHub पर [duplistatus repository](https://github.com/wsj-br/duplistatus) पर जाएं।
2. **"Releases"** अनुभाग पर जाएं (या राइट साइडबार में "Releases" पर क्लिक करें)।
3. **"Draft a new release."** पर क्लिक करें।
4. **"Choose a tag"** फ़ील्ड में, `vMAJOR.MINOR.PATCH` प्रारूप में अपना नया संस्करण संख्या टाइप करें (जैसे, `v1.2.0`)। यह एक नया टैग बनाएगा।
5. `master` को लक्ष्य शाखा के रूप में चुनें।
6. एक **रिलीज़ शीर्षक** जोड़ें (जैसे, "Release v1.2.0")।
7. इस संस्करण में हुए बदलावों का दस्तावेज़ करने वाला **विवरण** जोड़ें। आप:
   - `RELEASE_NOTES_github_VERSION.md` से सामग्री कॉपी कर सकते हैं (जो `scripts/generate-readme-from-intro.sh` द्वारा उत्पन्न की गई है)
   - या `documentation/docs/release-notes/` से रिलीज़ नोट्स का संदर्भ दे सकते हैं (लेकिन ध्यान दें कि रिलेटिव लिंक्स GitHub रिलीज़ में काम नहीं करेंगे)
8. **"Publish release."** पर क्लिक करें।

**क्या स्वचालित रूप से होता है:**
- एक नया Git टैग बनाया जाता है
- "Build and Publish Docker Image" वर्कफ़्लो ट्रिगर की जाती है
- AMD64 और ARM64 आर्किटेक्चर के लिए Docker इमेज बनाए जाते हैं
- इमेज पुश किए जाते हैं:
  - Docker Hub: `wsjbr/duplistatus:VERSION` और `wsjbr/duplistatus:latest` (यदि यह नवीनतम रिलीज़ है)
  - GitHub Container Registry: `ghcr.io/wsj-br/duplistatus:VERSION` और `ghcr.io/wsj-br/duplistatus:latest` (यदि यह नवीनतम रिलीज़ है)

## विधि 2: कमांड लाइन (वैकल्पिक) {#method-2-command-line-alternative}

यदि आप कमांड लाइन का उपयोग करना पसंद करते हैं, तो निम्नलिखित चरणों का पालन करें:

### चरण 1: स्थानीय मास्टर शाखा अपडेट करें {#step-1-update-local-master-branch}

सुनिश्चित करें कि आपका स्थानीय `master` शाखा अप टू डेट है:

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### चरण 2: विकास शाखा मर्ज करें {#step-2-merge-development-branch}

`vMAJOR.MINOR.x` शाखा को `master` में मर्ज करें:

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

यदि **मर्ज कनफ्लिक्ट** होते हैं, तो उन्हें मैन्युअल रूप से हल करें:
1. कनफ्लिक्टेड फाइलें संपादित करें
2. हल की गई फाइलें स्टेज करें: `git add <file>`
3. मर्ज पूरा करें: `git commit`

### चरण 3: रिलीज़ टैग करें {#step-3-tag-the-release}

नए संस्करण के लिए एक एनोटेटेड टैग बनाएं:

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

`-a` फ़्लैग एक एनोटेटेड टैग बनाता है (रिलीज़ के लिए अनुशंसित), और `-m` फ़्लैग एक संदेश जोड़ता है।

### चरण 4: GitHub पर पुश करें {#step-4-push-to-github}

अपडेट की गई `master` शाखा और नया टैग दोनों पुश करें:

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

वैकल्पिक रूप से, एक बार में सभी टैग पुश करें: `git push --tags`

### चरण 5: GitHub रिलीज़ बनाएं {#step-5-create-github-release}

टैग पुश करने के बाद, Docker बिल्ड वर्कफ़्लो ट्रिगर करने के लिए GitHub रिलीज़ बनाएं (विधि 1, चरण 3 देखें)।

## Docker छवि निर्माण {#manual-docker-image-build}

Docker छवि निर्माण वर्कफ़्लो को रिलीज़ बनाए बिना मैन्युअल रूप से ट्रिगर करने के लिए:

1. GitHub पर [duplistatus रिपॉजिटरी](https://github.com/wsj-br/duplistatus) पर जाएं।
2. **"Kriyaen"** टैब पर क्लिक करें।
3. **"Docker छवि बनाएँ और प्रकाशित करें"** वर्कफ़्लो का चयन करें।
4. **"Run workflow"** पर क्लिक करें।
5. उस शाखा का चयन करें जिसका निर्माण किया जाना है (सामान्यत: `master`)।
6. **"Run workflow"** पर फिर से क्लिक करें।

**Note:** मैन्युअल निर्माण छवियों को `latest` के रूप में स्वचालित रूप से टैग नहीं करेंगे जब तक कि वर्कफ़्लो नवीनतम रिलीज़ के रूप में निर्धारित न कर दे।

## दस्तावेज़ रिलीज़ {#releasing-documentation}

दस्तावेज़ [GitHub Pages](https://wsj-br.github.io/duplistatus/) पर होस्ट किए गए हैं और एप्लिकेशन रिलीज़ से अलग डिप्लॉय किए जाते हैं। अपडेट किए गए दस्तावेज़ रिलीज़ करने के लिए निम्नलिखित चरणों का पालन करें:

### आवश्यकताएँ {#prerequisites}

1. सुनिश्चित करें कि आपके पास GitHub Personal Access Token है जिसमें `repo` स्कोप है।
2. Git क्रेडेंशियल्स सेट अप करें (एक बार की सेटअप):

```bash
cd documentation
./setup-git-credentials.sh
```

यह आपको GitHub Personal Access Token के लिए प्रॉम्प्ट देगा और इसे सुरक्षित रूप से स्टोर करेगा।

### दस्तावेज़ डिप्लॉय करें {#deploy-documentation}

1. `documentation` डायरेक्टरी पर जाएं:

```bash
cd documentation
```

2. सुनिश्चित करें कि सभी दस्तावेज़ परिवर्तन रिपॉजिटरी में कमिट और पुश किए गए हैं।

3. दस्तावेज़ बनाएँ और डिप्लॉय करें:

```bash
pnpm run deploy
```

यह कमांड करेगा:
- Docusaurus दस्तावेज़ साइट बनाएँ
- बनाई गई साइट को `gh-pages` शाखा पर पुश करें
- [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/) पर दस्तावेज़ उपलब्ध कराएँ

### दस्तावेज़ डिप्लॉय करने का समय {#when-to-deploy-documentation}

दस्तावेज़ अपडेट डिप्लॉय करें:
- जब `master` में दस्तावेज़ परिवर्तन मर्ज किए गए हों
- जब एक नया संस्करण रिलीज़ किया जाए (यदि दस्तावेज़ अपडेट किया गया था)
- महत्वपूर्ण दस्तावेज़ सुधारों के बाद

**Note:** दस्तावेज़ डिप्लॉयमेंट एप्लिकेशन रिलीज़ से स्वतंत्र है। आप एप्लिकेशन रिलीज़ के बीच कई बार दस्तावेज़ डिप्लॉय कर सकते हैं।

### GitHub के लिए रिलीज़ नोट्स तैयार करना {#preparing-release-notes-for-github}

`generate-readme-from-intro.sh` स्क्रिप्ट स्वचालित रूप से रन होने पर GitHub रिलीज़ नोट्स उत्पन्न करती है। यह रिलीज़ नोट्स को `documentation/docs/release-notes/VERSION.md` से पढ़ती है (जहाँ VERSION `package.json` से निकाला जाता है) और प्रोजेक्ट रूट में `RELEASE_NOTES_github_VERSION.md` बनाती है।

**उदाहरण:**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

उत्पन्न रिलीज़ नोट फ़ाइल को सीधे GitHub रिलीज़ विवरण में कॉपी और पेस्ट किया जा सकता है। सभी लिंक और छवियां GitHub रिलीज़ संदर्भ में सही ढंग से काम करेंगे।

**Note:** The generated file is temporary and can be deleted after creating the GitHub release. It's recommended to add `RELEASE_NOTES_github_*.md` to `.gitignore` if you don't want to commit these files.

### README.md {#update-readmemd} को अपडेट करें

If you've made changes to `documentation/docs/intro.md`, regenerate the repository `README.md`:

```bash
./scripts/generate-readme-from-intro.sh
```

This script:
- Extracts the version from `package.json`
- Generates `README.md` from `documentation/docs/intro.md` (converts Docusaurus admonitions to GitHub-style alerts, converts links and images)
- Creates `README_dockerhub.md` for Docker Hub (with Docker Hub-compatible formatting)
- Generates `RELEASE_NOTES_github_VERSION.md` from `documentation/docs/release-notes/VERSION.md` (converts links and images to absolute URLs)
- Updates the table of contents using `doctoc`

Commit and push the updated `README.md` along with your release.
