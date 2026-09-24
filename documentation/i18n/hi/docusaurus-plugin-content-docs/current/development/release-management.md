# रिलीज प्रबंधन {/* #release-management */}

## संस्करणीकरण (सेमेंटिक संस्करणीकरण) {/* #versioning-semantic-versioning */}

प्रोजेक्ट सेमेंटिक संस्करणीकरण (SemVer) का पालन करता है जिसमें प्रारूप `MAJOR.MINOR.PATCH` है:

- **मुख्य** संस्करण (x.0.0): जब आप असंगत API परिवर्तन करते हैं
- **लघु** संस्करण (0.x.0): जब आप पीछे से संगत तरीके से कार्यक्षमता जोड़ते हैं
- **पैच** संस्करण (0.0.x): जब आप पीछे से संगत बग फिक्स करते हैं

## प्री-रिलीज चेकलिस्ट {/* #pre-release-checklist */}

नया संस्करण जारी करने से पहले, सुनिश्चित करें कि आपने निम्नलिखित पूरा कर लिया है:

- [ ] सभी परिवर्तनों को `vMAJOR.MINOR.x` शाखा में प्रतिबद्ध और पुश किया गया है।
- [ ] `package.json` में संस्करण संख्या अपडेट की गई है (फ़ाइलों में इसे सिंक्रनाइज़ करने के लिए `scripts/update-version.sh` का उपयोग करें)।
- [ ] सभी परीक्षण पास हो गए हैं (डेवल मोड, स्थानीय, डॉकर और पॉडमैन में)। 
- [ ] `pnpm docker:up` के साथ डॉकर कंटेनर शुरू करें और डेवलपमेंट वातावरण और डॉकर कंटेनर के बीच संस्करण सुसंगतता को सत्यापित करने के लिए `scripts/compare-versions.sh` चलाएं (डॉकर कंटेनर के चलने की आवश्यकता है)। यह स्क्रिप्ट केवल मुख्य संस्करण के अनुसार SQLite संस्करणों की तुलना करती है (उदाहरण के लिए, 3.45.1 बनाम 3.51.1 को संगत माना जाता है), और नोड, एनपीएम और duplistatus संस्करणों की सटीक तुलना करती है।
- [ ] दस्तावेज़ अद्यतन है, स्क्रीनशॉट अपडेट करें (`pnpm take-screenshots` का उपयोग करें)
- [ ] `documentation/docs/release-notes/VERSION.md` में रिलीज़ नोट्स तैयार किए गए हैं।
- [ ] `documentation/docs/intro.md` से नए संस्करण और कोई परिवर्तन के साथ `README.md` को अपडेट करने के लिए `scripts/generate-readme-from-intro.sh` चलाएं। यह स्क्रिप्ट स्वचालित रूप से `README_dockerhub.md` और `RELEASE_NOTES_github_VERSION.md` भी उत्पन्न करती है।

## रिलीज प्रक्रिया अवलोकन {/* #release-process-overview */}

अनुशंसित रिलीज़ प्रक्रिया **GitHub पुल अनुरोध और रिलीज़** का उपयोग करती है (नीचे देखें)। यह बेहतर दृश्यता, समीक्षा क्षमता प्रदान करता है और स्वचालित रूप से डॉकर छवि बिल्ड को ट्रिगर करता है। कमांड-लाइन विधि विकल्प के रूप में उपलब्ध है।

## विधि 1: GitHub पुल अनुरोध और रिलीज़ (अनुशंसित) {/* #method-1-github-pull-request-and-release-recommended */}

यह पसंदीदा विधि है क्योंकि यह बेहतर परिवर्तन पर नज़र रखने की क्षमता प्रदान करती है और स्वचालित रूप से डॉकर बिल्ड को ट्रिगर करती है।

### चरण 1: पुल अनुरोध बनाएं {/* #step-1-create-pull-request */}

1. GitHub पर [duplistatus रिपॉजिटरी](https://github.com/wsj-br/duplistatus) पर जाएं।
2. **"पुल अनुरोध"** टैब पर क्लिक करें।
3. **"नया पुल अनुरोध"** पर क्लिक करें।
4. **आधार शाखा** को `master` और **तुलना शाखा** को `vMAJOR.MINOR.x` पर सेट करें।
5. सुनिश्चित करें कि सब कुछ सही दिखाई दे रहा है, परिवर्तनों का पूर्वावलोकन देखें।
6. **"पुल अनुरोध बनाएं"** पर क्लिक करें।
7. वर्णनात्मक शीर्षक जोड़ें (उदाहरण के लिए, "रिलीज़ v1.2.0") और परिवर्तनों का सारांश देने वाला विवरण।
8. फिर से **"पुल अनुरोध बनाएं"** पर क्लिक करें।

### चरण 2: पुल अनुरोध मर्ज करें {/* #step-2-merge-the-pull-request */}

पुल अनुरोध की समीक्षा करने के बाद:

1. यदि कोई संघर्ष नहीं है, तो हरे रंग के **"पुल अनुरोध मर्ज करें"** बटन पर क्लिक करें।
2. अपनी मर्ज रणनीति चुनें (आमतौर पर "मर्ज कमिट बनाएं")।
3. मर्ज की पुष्टि करें।

### चरण 3: GitHub रिलीज़ बनाएं {/* #step-3-create-github-release */}

एक बार मर्ज पूरा हो जाने के बाद, एक GitHub रिलीज़ बनाएं:

1. GitHub पर [duplistatus रिपॉजिटरी](https://github.com/wsj-br/duplistatus) पर नेविगेट करें।
2. **"Releases"** अनुभाग पर जाएँ (या दाएँ साइडबार में "Releases" पर क्लिक करें)।
3. **"Draft a new release."** पर क्लिक करें।
4. **"Choose a tag"** फ़ील्ड में, `vMAJOR.MINOR.PATCH` प्रारूप में अपनी नई संस्करण संख्या टाइप करें (उदाहरण के लिए, `v1.2.0`)। यह एक नया टैग बनाएगा।
5. लक्ष्य शाखा के रूप में `master` का चयन करें।
6. एक **release title** जोड़ें (उदाहरण के लिए, "Release v1.2.0")।
7. इस संस्करण में परिवर्तनों को दस्तावेज़ीकृत करने वाला एक **description** जोड़ें। आप कर सकते हैं:
   - `RELEASE_NOTES_github_VERSION.md` से सामग्री कॉपी करें (`scripts/generate-readme-from-intro.sh` द्वारा उत्पन्न)
   - या `documentation/docs/release-notes/` से रिलीज़ नोट्स का संदर्भ लें (लेकिन ध्यान रखें कि GitHub रिलीज़ में सापेक्ष लिंक काम नहीं करेंगे)
8. **"Publish release."** पर क्लिक करें।

**स्वचालित रूप से क्या होता है:**
- एक नया Git टैग बनाया जाता है
- "Build and Publish Docker Image" वर्कफ़्लो ट्रिगर होता है
- AMD64 और ARM64 आर्किटेक्चर के लिए Docker छवियाँ बनाई जाती हैं
- छवियाँ यहाँ पुश की जाती हैं:
  - Docker Hub: `wsjbr/duplistatus:VERSION` और `wsjbr/duplistatus:latest` (यदि यह नवीनतम रिलीज़ है)
  - GitHub कंटेनर रजिस्ट्री: `ghcr.io/wsj-br/duplistatus:VERSION` और `ghcr.io/wsj-br/duplistatus:latest` (यदि यह नवीनतम रिलीज़ है)

## विधि 2: कमांड लाइन (वैकल्पिक) {/* #method-2-command-line-alternative */}

उस कमिट से जिसे रिलीज़ किया जाना चाहिए (आमतौर पर `master`, जो पहले ही पुश किया जा चुका है), एक साफ़ वर्किंग ट्री और `documentation/docs/release-notes/VERSION.md` के अपनी जगह पर होने के साथ:

```bash
pnpm release:github:dry   # print the planned tag, notes file, and gh command
pnpm release:github       # generate GitHub notes, tag vVERSION at HEAD, publish the release, and deploy the docs
```

`scripts/release.mjs`, `package.json` से संस्करण पढ़ता है, `scripts/generate-readme-from-intro.sh` चलाता है (ताकि `RELEASE_NOTES_github_VERSION.md` में एब्सोल्यूट लिंक हों), और GitHub रिलीज़ बनाता है। इसे पब्लिश करने से Docker इमेज वर्कफ़्लो शुरू होता है। फिर स्क्रिप्ट Docusaurus साइट बनाने और उसे `gh-pages` पर पुश करने के लिए `documentation/` में `pnpm run deploy` चलाती है। यदि टैग `vVERSION` या वह GitHub रिलीज़ पहले से मौजूद है, तो स्क्रिप्ट उन्हें हटा देती है और वर्तमान HEAD पर टैग फिर से बना देती है। क्लीन-ट्री जाँचों को छोड़ने के लिए `--verify-clean=false` पास करें।

नीचे दिए गए चरण वही ऑपरेशन हैं जो मैन्युअल रूप से चलाए जाते हैं।

### चरण 1: स्थानीय मास्टर शाखा अद्यतन करें {/* #step-1-update-local-master-branch */}

सुनिश्चित करें कि आपकी स्थानीय `master` शाखा अद्यतित है:

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### चरण 2: विकास शाखा मर्ज करें {/* #step-2-merge-development-branch */}

`vMAJOR.MINOR.x` शाखा को `master` में मर्ज करें:

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

यदि **मर्ज संघर्ष** हैं, तो उन्हें मैन्युअल रूप से हल करें:
1. विवादित फ़ाइलों को संपादित करें
2. हल की गई फ़ाइलों को स्टेज करें: `git add <file>`
3. मर्ज पूरा करें: `git commit`

### चरण 3: रिलीज़ टैग करें {/* #step-3-tag-the-release */}

नए संस्करण के लिए एक संलग्न टैग बनाएँ:

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

`-a` फ़्लैग एक संलग्न टैग बनाता है (रिलीज़ के लिए अनुशंसित), और `-m` फ़्लैग एक संदेश जोड़ता है।

### चरण 4: GitHub पर पुश करें {/* #step-4-push-to-github */}

अद्यतित `master` शाखा और नए टैग दोनों को पुश करें:

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

वैकल्पिक रूप से, सभी टैग एक बार में पुश करें: `git push --tags`

### चरण 5: GitHub रिलीज़ बनाएँ {/* #step-5-create-github-release */}

टैग पुश करने के बाद, Docker बिल्ड वर्कफ़्लो ट्रिगर करने के लिए एक GitHub रिलीज़ बनाएँ (विधि 1, चरण 3 देखें)।

## मैनुअल Docker छवि बिल्ड {/* #manual-docker-image-build */}

रिलीज बनाए बिना डॉकर छवि बिल्ड कार्यप्रवाह को मैन्युअल रूप से ट्रिगर करने के लिए:

1. GitHub पर [duplistatus रिपॉजिटरी](https://github.com/wsj-br/duplistatus) पर जाएँ।
2. **"कार्रवाइयाँ"** टैब पर क्लिक करें।
3. **"डॉकर छवि बनाएँ और प्रकाशित करें"** कार्यप्रवाह का चयन करें।
4. **"कार्यप्रवाह चलाएँ"** पर क्लिक करें।
5. बिल्ड करने के लिए शाखा का चयन करें (आमतौर पर `master`)।
6. फिर से **"कार्यप्रवाह चलाएँ"** पर क्लिक करें।

**नोट:** मैन्युअल बिल्ड स्वचालित रूप से छवियों को `latest` के रूप में टैग नहीं करेगा जब तक कि कार्यप्रवाह यह निर्धारित न करे कि यह नवीनतम रिलीज है।

## दस्तावेज़ीकरण रिलीज़ {/* #releasing-documentation */}

दस्तावेज़ीकरण [GitHub Pages](https://wsj-br.github.io/duplistatus/) पर होस्ट किया गया है। `pnpm release:github` GitHub रिलीज़ पब्लिश करने के बाद इसे डिप्लॉय करता है। एप्लिकेशन रिलीज़ के बीच साइट को अपडेट करने के लिए, इन चरणों का पालन करें:

### पूर्वापेक्षाएँ {/* #prerequisites */}

1. सुनिश्चित करें कि आपके पास `repo` स्कोप के साथ एक GitHub व्यक्तिगत पहुँच टोकन है।
2. Git क्रेडेंशियल सेट करें (एक बार की सेटअप):

```bash
cd documentation
./setup-git-credentials.sh
```

यह आपके GitHub व्यक्तिगत पहुँच टोकन के लिए आपसे प्रॉम्प्ट करेगा और इसे सुरक्षित रूप से संग्रहीत करेगा।

### दस्तावेज़ीकरण तैनात करें {/* #deploy-documentation */}

1. `documentation` निर्देशिका पर जाएँ:

```bash
cd documentation
```

2. सुनिश्चित करें कि सभी दस्तावेज़ीकरण परिवर्तनों को कमिट किया गया है और रिपॉजिटरी में पुश किया गया है।

3. दस्तावेज़ीकरण बनाएँ और तैनात करें:

```bash
pnpm run deploy
```

यह कमांड ऐसा करेगा:
- Docusaurus दस्तावेज़ीकरण साइट का निर्माण करेगा
- बनाई गई साइट को `gh-pages` शाखा पर पुश करेगा
- [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/) पर दस्तावेज़ीकरण उपलब्ध कराएगा

### दस्तावेज़ीकरण कब तैनात करें {/* #when-to-deploy-documentation */}

दस्तावेज़ीकरण अपडेट तैनात करें:
- `master` में दस्तावेज़ीकरण परिवर्तन मर्ज करने के बाद
- नया संस्करण रिलीज़ करते समय (यदि दस्तावेज़ीकरण अपडेट किया गया था)
- महत्वपूर्ण दस्तावेज़ीकरण सुधारों के बाद

**नोट:** दस्तावेज़ीकरण तैनाती एप्लिकेशन रिलीज़ से स्वतंत्र है। आप एप्लिकेशन रिलीज़ के बीच में कई बार दस्तावेज़ीकरण तैनात कर सकते हैं।

### GitHub के लिए रिलीज़ नोट तैयार करना {/* #preparing-release-notes-for-github */}

`generate-readme-from-intro.sh` स्क्रिप्ट चलाए जाने पर स्वचालित रूप से GitHub रिलीज़ नोट उत्पन्न करता है। यह `documentation/docs/release-notes/VERSION.md` से रिलीज़ नोट पढ़ता है (जहाँ संस्करण `package.json` से निकाला जाता है) और प्रोजेक्ट रूट में `RELEASE_NOTES_github_VERSION.md` बनाता है।

**उदाहरण:**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

उत्पन्न रिलीज़ नोट्स फ़ाइल को सीधे GitHub रिलीज़ विवरण में कॉपी और पेस्ट किया जा सकता है। GitHub रिलीज़ संदर्भ में सभी लिंक और छवियाँ सही ढंग से काम करेंगी।

**नोट:** उत्पन्न फ़ाइल अस्थायी है और GitHub रिलीज़ बनाने के बाद इसे हटाया जा सकता है। यदि आप इन फ़ाइलों को commit करना नहीं चाहते हैं तो यह जोड़ना अनुशंसित है `RELEASE_NOTES_github_*.md` से `.gitignore`।

### README.md अपडेट करें {/* #update-readmemd */}

यदि आपने `documentation/docs/intro.md` में परिवर्तन किए हैं, तो रिपॉजिटरी `README.md` पुनः उत्पन्न करें:

```bash
./scripts/generate-readme-from-intro.sh
```

यह स्क्रिप्ट:
- `package.json` से संस्करण निकालता है
- `README.md` को `documentation/docs/intro.md` से उत्पन्न करता है (Docusaurus सलाह को GitHub-शैली के अलर्ट में परिवर्तित करता है, लिंक और छवियाँ परिवर्तित करता है)
- Docker Hub के लिए `README_dockerhub.md` बनाता है (Docker Hub-अनुकूल प्रारूपण के साथ)
- `RELEASE_NOTES_github_VERSION.md` को `documentation/docs/release-notes/VERSION.md` से उत्पन्न करता है (लिंक और छवियों को पूर्ण URL में परिवर्तित करता है)
- `doctoc` का उपयोग करके विषय सूची अपडेट करता है

अपने रिलीज़ के साथ अपडेट किए गए `README.md` को commit और push करें।
