# रिलीज़ प्रबंधन {/* #release-management */}

## वर्शनिंग (सिमेंटिक वर्शनिंग) {/* #versioning-semantic-versioning */}

यह प्रोजेक्ट `MAJOR.MINOR.PATCH` प्रारूप के साथ सिमेंटिक वर्शनिंग (SemVer) का पालन करता है:

- **MAJOR** संस्करण (x.0.0): जब आप असंगत (incompatible) API परिवर्तन करते हैं
- **MINOR** संस्करण (0.x.0): जब आप बैकवर्ड-कम्पैटिबल तरीके से कार्यक्षमता जोड़ते हैं
- **PATCH** संस्करण (0.0.x): जब आप बैकवर्ड-कम्पैटिबल बग फिक्स करते हैं

## रिलीज़-पूर्व चेकलिस्ट {/* #pre-release-checklist */}

नया संस्करण रिलीज़ करने से पहले, सुनिश्चित करें कि आपने निम्नलिखित कार्य पूरे कर लिए हैं:

- [ ] सभी परिवर्तन कमिट कर दिए गए हैं और `vMAJOR.MINOR.x` शाखा में पुश कर दिए गए हैं।
- [ ] संस्करण संख्या को `package.json` में अपडेट कर दिया गया है (फ़ाइलें भर में इसे सिंक्रनाइज़ करने के लिए `scripts/update-version.sh` का उपयोग करें)।
- [ ] सभी परीक्षण पास हो जाते हैं (डेवलपमेंट मोड, लोकल, docker और podman में)।
- [ ] `pnpm docker:up` के साथ एक Docker कंटेनर प्रारंभ करें और डेवलपमेंट परिवेश और Docker कंटेनर के बीच संस्करण संगतता सत्यापित करने के लिए `scripts/compare-versions.sh` चलाएं (इसके लिए Docker कंटेनर का चालू होना आवश्यक है)। यह स्क्रिप्ट केवल प्रमुख संस्करण के आधार पर SQLite संस्करणों की तुलना करती है (उदा., 3.45.1 बनाम 3.51.1 को संगत माना जाता है), और Node, npm और Duplistatus संस्करणों की सटीक तुलना करती है।
- [ ] दस्तावेज़ अप टू डेट हैं, स्क्रीनशॉट अपडेट करें (`pnpm take-screenshots` का उपयोग करें)
- [ ] रिलीज़ नोट्स `documentation/docs/release-notes/VERSION.md` में तैयार हैं।
- [ ] नए संस्करण और `documentation/docs/intro.md` के किसी भी परिवर्तन के साथ `README.md` को अपडेट करने के लिए `scripts/generate-readme-from-intro.sh` चलाएं। यह स्क्रिप्ट स्वचालित रूप से `README_dockerhub.md` और `RELEASE_NOTES_github_VERSION.md` भी जनरेट करती है।

## रिलीज़ प्रक्रिया अवलोकन {/* #release-process-overview */}

अनुशंसित रिलीज़ प्रक्रिया **GitHub Pull Requests and Releases** का उपयोग करती है (नीचे देखें)। यह बेहतर दृश्यता, समीक्षा क्षमताएं प्रदान करता है, और स्वचालित रूप से Docker इमेज बिल्ड को ट्रिगर करता है। कमांड-लाइन विधि एक विकल्प के रूप में उपलब्ध है।

## विधि 1: GitHub पुल रिक्वेस्ट और रिलीज़ (अनुशंसित) {/* #method-1-github-pull-request-and-release-recommended */}

यह पसंदीदा विधि है क्योंकि यह बेहतर ट्रैसेबिलिटी प्रदान करती है और स्वचालित रूप से Docker बिल्ड ट्रिगर करती है।

### चरण 1: पुल रिक्वेस्ट बनाएं {/* #step-1-create-pull-request */}

1. GitHub पर [duplistatus रिपॉजिटरी](https://github.com/wsj-br/duplistatus) पर जाएं।
2. **"Pull requests"** टैब पर क्लिक करें।
3. **"New pull request"** पर क्लिक करें।
4. **base branch** को `master` और **compare branch** को `vMAJOR.MINOR.x` पर सेट करें।
5. सब कुछ सही दिखने की पुष्टि करने के लिए परिवर्तन पूर्वावलोकन की समीक्षा करें।
6. **"Create pull request"** पर क्लिक करें।
7. एक विवरणात्मक शीर्षक (उदा., "Release v1.2.0") और परिवर्तनों का सारांश देने वाला विवरण जोड़ें।
8. फिर से **"Create pull request"** पर क्लिक करें।

### चरण 2: पुल रिक्वेस्ट को मर्ज करें {/* #step-2-merge-the-pull-request */}

पुल रिक्वेस्ट की समीक्षा करने के बाद:

1. यदि कोई विरोध (conflict) नहीं है, तो हरे रंग के **"Merge pull request"** बटन पर क्लिक करें।
2. अपनी मर्ज रणनीति चुनें (आमतौर पर "Create a merge commit")।
3. मर्ज की पुष्टि करें।

### चरण 3: GitHub रिलीज़ बनाएं {/* #step-3-create-github-release */}

मर्ज पूरा होने के बाद, एक GitHub रिलीज़ बनाएं:

1. GitHub पर [duplistatus रिपॉजिटरी](https://github.com/wsj-br/duplistatus) पर जाएँ।
2. **"Releases"** अनुभाग पर जाएँ (या दाएँ साइडबार में "Releases" पर क्लिक करें)।
3. **"Draft a new release."** पर क्लिक करें।
4. **"Choose a tag"** फ़ील्ड में, `vMAJOR.MINOR.PATCH` प्रारूप में अपनी नई संस्करण संख्या टाइप करें (उदा., `v1.2.0`)। इससे एक नया टैग बन जाएगा।
5. लक्ष्य शाखा के रूप में `master` चुनें।
6. एक **रिलीज़ शीर्षक** जोड़ें (उदा., "Release v1.2.0")।
7. इस संस्करण में हुए परिवर्तनों का दस्तावेज़ीकरण करते हुए एक **विवरण** जोड़ें। आप:
   - `RELEASE_NOTES_github_VERSION.md` (`scripts/generate-readme-from-intro.sh` द्वारा जनरेट की गई) से सामग्री कॉपी करें
   - या `documentation/docs/release-notes/` से रिलीज़ नोट्स का संदर्भ लें (लेकिन ध्यान रखें कि GitHub रिलीज़ में सापेक्ष लिंक काम नहीं करेंगे)
8. **"Publish release."** पर क्लिक करें।

**स्वचालित रूप से क्या होता है:**
- एक नया Git टैग बनाया जाता है
- "Build and Publish Docker Image" वर्कफ़्लो ट्रिगर होता है
- AMD64 और ARM64 आर्किटेक्चर के लिए Docker इमेज बनाई जाती हैं
- इमेज यहाँ पुश की जाती हैं:
  - Docker Hub: `wsjbr/duplistatus:VERSION` और `wsjbr/duplistatus:latest` (यदि यह नवीनतम रिलीज़ है)
  - GitHub Container Registry: `ghcr.io/wsj-br/duplistatus:VERSION` और `ghcr.io/wsj-br/duplistatus:latest` (यदि यह नवीनतम रिलीज़ है)

## विधि 2: कमांड लाइन (वैकल्पिक) {/* #method-2-command-line-alternative */}

यदि आप कमांड लाइन का उपयोग करना पसंद करते हैं, तो इन चरणों का पालन करें:

### चरण 1: लोकल Master ब्रांच को अपडेट करें {/* #step-1-update-local-master-branch */}

सुनिश्चित करें कि आपकी लोकल `master` ब्रांच अप-टू-डेट है:

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### चरण 2: डेवलपमेंट ब्रांच को मर्ज करें {/* #step-2-merge-development-branch */}

`vMAJOR.MINOR.x` ब्रांच को `master` में मर्ज करें:

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

यदि **मर्ज कॉन्फ़्लिक्ट** हैं, तो उन्हें मैन्युअल रूप से हल करें:
1. कॉन्फ़्लिक्ट वाली फ़ाइलें संपादित करें
2. हल की गई फ़ाइलें स्टेज करें: `git add <file>`
3. मर्ज पूरा करें: `git commit`

### चरण 3: रिलीज़ को टैग करें {/* #step-3-tag-the-release */}

नए संस्करण के लिए एक एनोटेटेड टैग बनाएँ:

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

`-a` फ़्लैग एक एनोटेटेड टैग बनाता है (रिलीज़ के लिए अनुशंसित), और `-m` फ़्लैग एक संदेश जोड़ता है।

### चरण 4: GitHub पर पुश करें {/* #step-4-push-to-github */}

अपडेट की गई `master` ब्रांच और नए टैग दोनों को पुश करें:

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

वैकल्पिक रूप से, एक ही बार में सभी टैग पुश करें: `git push --tags`

### चरण 5: GitHub रिलीज़ बनाएँ {/* #step-5-create-github-release */}

टैग पुश करने के बाद, Docker बिल्ड वर्कफ़्लो को ट्रिगर करने के लिए एक GitHub रिलीज़ बनाएँ (विधि 1, चरण 3 देखें)।

## मैन्युअल Docker इमेज बिल्ड {/* #manual-docker-image-build */}

रिलीज़ बनाए बिना Docker इमेज बिल्ड वर्कफ़्लो को मैन्युअल रूप से ट्रिगर करने के लिए:

1. GitHub पर [duplistatus रिपॉजिटरी](https://github.com/wsj-br/duplistatus) पर जाएं।
2. **"कार्रवाइयाँ"** टैब पर क्लिक करें।
3. **"Build and Publish Docker Image"** वर्कफ़्लो चुनें।
4. **"Run workflow"** पर क्लिक करें।
5. वह शाखा चुनें जिससे बिल्ड करना है (आमतौर पर `master`)।
6. दोबारा **"Run workflow"** पर क्लिक करें।

**नोट:** मैन्युअल बिल्ड स्वचालित रूप से इमेज को `latest` के रूप में टैग नहीं करेंगे, जब तक कि वर्कफ़्लो यह निर्धारित न कर ले कि यह नवीनतम रिलीज़ है।

## दस्तावेज़ीकरण रिलीज़ करना {/* #releasing-documentation */}

दस्तावेज़ीकरण [GitHub Pages](https://wsj-br.github.io/duplistatus/) पर होस्ट किया गया है और इसे एप्लिकेशन रिलीज़ से अलग डिप्लॉय किया जाता है। अपडेट किए गए दस्तावेज़ों को रिलीज़ करने के लिए इन चरणों का पालन करें:

### पूर्वापेक्षाएँ {/* #prerequisites */}

1. सुनिश्चित करें कि आपके पास `repo` स्कोप वाला GitHub पर्सनल एक्सेस टोकन है।
2. Git क्रेडेंशियल सेट अप करें (एक बार का सेटअप):

```bash
cd documentation
./setup-git-credentials.sh
```

यह आपसे आपके GitHub पर्सनल एक्सेस टोकन के लिए पूछेगा और इसे सुरक्षित रूप से संग्रहीत करेगा।

### दस्तावेज़ीकरण डिप्लॉय करें {/* #deploy-documentation */}

1. `documentation` डायरेक्टरी पर जाएं:

```bash
cd documentation
```

2. सुनिश्चित करें कि दस्तावेज़ीकरण के सभी बदलाव कमिट और रिपॉजिटरी में पुश कर दिए गए हैं।

3. दस्तावेज़ीकरण को बिल्ड और डिप्लॉय करें:

```bash
pnpm run deploy
```

यह कमांड:
- Docusaurus दस्तावेज़ीकरण साइट को बिल्ड करेगी
- बिल्ड की गई साइट को `gh-pages` शाखा में पुश करेगी
- दस्तावेज़ीकरण को [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/) पर उपलब्ध कराएगी

### दस्तावेज़ीकरण कब डिप्लॉय करें {/* #when-to-deploy-documentation */}

दस्तावेज़ीकरण अपडेट डिप्लॉय करें:
- दस्तावेज़ीकरण परिवर्तनों को `master` में मर्ज करने के बाद
- नया संस्करण रिलीज़ करते समय (यदि दस्तावेज़ीकरण अपडेट किया गया था)
- दस्तावेज़ीकरण में महत्वपूर्ण सुधारों के बाद

**नोट:** दस्तावेज़ीकरण डिप्लॉयमेंट एप्लिकेशन रिलीज़ से स्वतंत्र है। आप एप्लिकेशन रिलीज़ के बीच कई बार दस्तावेज़ डिप्लॉय कर सकते हैं।

### GitHub के लिए रिलीज़ नोट्स तैयार करना {/* #preparing-release-notes-for-github */}

रन होने पर `generate-readme-from-intro.sh` स्क्रिप्ट स्वचालित रूप से GitHub रिलीज़ नोट्स जनरेट करती है। यह `documentation/docs/release-notes/VERSION.md` से रिलीज़ नोट्स पढ़ती है (जहाँ VERSION को `package.json` से निकाला जाता है) और प्रोजेक्ट रूट में `RELEASE_NOTES_github_VERSION.md` बनाती है।

**उदाहरण:**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

जनरेट की गई रिलीज़ नोट्स फ़ाइल को सीधे GitHub रिलीज़ विवरण में कॉपी और पेस्ट किया जा सकता है। GitHub रिलीज़ के संदर्भ में सभी लिंक और इमेज ठीक से काम करेंगे।

**ध्यान दें:** जनरेट की गई फ़ाइल अस्थायी है और GitHub रिलीज़ बनाने के बाद इसे हटाया जा सकता है। यदि आप ये फ़ाइलें कमिट नहीं करना चाहते हैं, तो यह अनुशंसा की जाती है कि `.gitignore` में `RELEASE_NOTES_github_*.md` जोड़ें।

### README.md अपडेट करें {/* #update-readmemd */}

यदि आपने `documentation/docs/intro.md` में बदलाव किए हैं, तो रिपॉजिटरी `README.md` को फिर से जनरेट करें:

```bash
./scripts/generate-readme-from-intro.sh
```

यह स्क्रिप्ट:
- `package.json` से संस्करण निकालती है
- `documentation/docs/intro.md` से `README.md` जनरेट करती है (Docusaurus admonitions को GitHub-शैली के अलर्ट में बदलती है, लिंक और इमेज को बदलती है)
- Docker Hub के लिए `README_dockerhub.md` बनाती है (Docker Hub-संगत फ़ॉर्मेटिंग के साथ)
- `documentation/docs/release-notes/VERSION.md` से `RELEASE_NOTES_github_VERSION.md` जनरेट करती है (लिंक और इमेज को पूर्ण URL में बदलती है)
- `doctoc` का उपयोग करके विषय-सूची को अपडेट करती है

अपनी रिलीज़ के साथ अपडेट किए गए `README.md` को कमिट और पुश करें।
