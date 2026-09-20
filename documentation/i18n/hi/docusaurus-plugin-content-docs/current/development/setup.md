# विकास सेटअप {/* #development-setup */}

## पूर्वापेक्षाएँ {/* #prerequisites */}

- डॉकर / डॉकर कंपोज़
- नोड.जेएस (देखें `engines.node` में `package.json`)
- पीएनपीएम (देखें `engines.pnpm` / `packageManager` में `package.json`)
- एसक्यूलाइट3
- इंकस्केप (दस्तावेज़ीकरण एसवीजी अनुवाद और पीएनजी निर्यात के लिए; केवल आवश्यक यदि आप `translate` या `translate:svg` चलाते हैं)
- बैट/बैटकैट (`translate:help` का एक सुंदर संस्करण दिखाने के लिए)
- डायरएनवी (स्वचालित रूप से `.env*` फ़ाइलें लोड करने के लिए)
- प्लेव्राइट क्रोमियम (`pnpm install` के बाद `pnpm take-screenshots:install` चलाएँ; यह `playwright install chromium` चलाता है)

## चरण {/* #steps */}

### 1. रिपॉजिटरी क्लोन करें: {/* #1-clone-the-repository */}

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

### 2. निर्भरताएँ स्थापित करें (डेबियन/उबंटू): {/* #2-install-dependencies-debianubuntu */}

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    sudo apt install -y build-essential python3 python3-dev python3-setuptools make g++ gcc pkg-config 
    ```

### 3. पुराने नोड.जेएस स्थापनाएँ निकालें (यदि आपके पास पहले से स्थापित है) {/* #3-remove-old-nodejs-installations-if-you-already-have-it-installed */}

    ```bash
    sudo apt-get purge nodejs npm -y
    sudo apt-get autoremove -y
    sudo rm -rf /usr/local/bin/npm 
    sudo rm -rf /usr/local/share/man/man1/node* 
    sudo rm -rf /usr/local/lib/dtrace/node.d
    rm -rf ~/.npm
    rm -rf ~/.node-gyp
    sudo rm -rf /opt/local/bin/node
    sudo rm -rf /opt/local/include/node
    sudo rm -rf /opt/local/lib/node_modules
    sudo rm -rf /usr/local/lib/node*
    sudo rm -rf /usr/local/include/node*
    sudo rm -rf /usr/local/bin/node*
    ```

### 4. नोड.जेएस और पीएनपीएम स्थापित करें: {/* #4-install-nodejs-and-pnpm */}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm config set allow-scripts=pnpm --location=user
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. डायरएनवी समर्थन सेट करें {/* #5-set-up-direnv-support */}

अपनी `~/.bashrc` फ़ाइल में ये पंक्तियाँ जोड़ें

    ```bash 
    # direnv support (apt install direnv)
    eval "$(direnv hook bash)"
    ```

इस कमांड के साथ:

    ```bash 
    (echo "# direnv support (apt install direnv)"; echo 'eval "$(direnv hook bash)') >> ~/.bashrc
    ```

रिपॉजिटरी बेसडायर में, चलाएँ:

    ```bash
    direnv allow
    ```

अपनी `~/.profile` फ़ाइल में ये पंक्तियाँ जोड़ें

    ```bash 
    # export the Bash environment (needed for code editor or AI Agents to load it).
    export BASH_ENV="$HOME/.bashrc"
    ```

इस कमांड के साथ:

    ```bash 
    (echo "# export the Bash environment (needed for code editor or AI Agents to load it)."; \
     echo 'export BASH_ENV="$HOME/.bashrc"') >> ~/.profile
    ```

:::info
  आपको टर्मिनल को फिर से खोलने की आवश्यकता है या कोड संपादक आईडीई (विजुअल स्टूडियो कोड, 
  कर्सर, लिंगमा, एंटीग्रेविटी, जेड, ...) को बंद/फिर से खोलने की आवश्यकता हो सकती है ताकि ये परिवर्तन प्रभावी हो सकें।
:::

### 6. रिपॉजिटरी बेसडायर पर `.env` फ़ाइल बनाएँ इन चरों के साथ। {/* #6-create-the-env-file-at-the-repository-basedir-with-these-variables */}

- आप `VERSION` के लिए कोई भी मान उपयोग कर सकते हैं; यह स्वचालित रूप से अद्यतन हो जाएगा जब आप विकास स्क्रिप्ट का उपयोग करेंगे।
- `ADMIN_PASSWORD` और `USER_PASSWORD` के लिए यादृच्छिक पासवर्ड का उपयोग करें; ये पासवर्ड `pnpm take-screenshots` स्क्रिप्ट में उपयोग किए जाएंगे।
- आप [openrouter.ai](https://openrouter.ai) से `OPENROUTER_API_KEY` प्राप्त कर सकते हैं।

    ```bash
    VERSION=x.x.x

    # Development user passwords
    ADMIN_PASSWORD="admin_secret"
    USER_PASSWORD="user_secret"


    # Openrouter.ai API key for translation scripts in documentation 
    OPENROUTER_API_KEY=sk-or-v1-your-key-for-translate-files
    ```

## उपलब्ध स्क्रिप्ट {/* #available-scripts */}

परियोजना में विभिन्न विकास कार्यों के लिए कई एनपीएम स्क्रिप्ट शामिल हैं:

### डेवलपमेंट स्क्रिप्ट्स {/* #development-scripts */}
- `pnpm dev` - Next.js डेवलपमेंट सर्वर (पोर्ट 8666) और क्रॉन सेवा (पोर्ट 8667) को एक साथ `concurrently` के माध्यम से प्रारंभ करें (प्री-चेक सहित)। CTRL-C दोनों को रोक देता है। Next.js के लिए `NODE_OPTIONS` `scripts/dev-preload.cjs` लोड करता है, जो `scripts/peer-ip.cjs` (IP अनुमति सूचियों के लिए TCP पीयर पता) और अनुरोध-लॉग टाइमस्टैम्प लागू करता है।
- `pnpm dev:next` - केवल पोर्ट 8666 पर Next.js डेवलपमेंट सर्वर प्रारंभ करें (कोई क्रॉन नहीं)।
- `pnpm build` - उत्पादन के लिए एप्लिकेशन बनाएं (प्री-चेक सहित)
- `pnpm lint` - कोड गुणवत्ता की जांच करने के लिए ESLint चलाएं
- `pnpm typecheck` - TypeScript प्रकार जांच चलाएं
- `scripts/upgrade-dependencies.sh` — हर वर्कस्पेस पैकेज का निर्माण-सुरक्षित अपग्रेड (ऑटो-डिटेक्ट किया गया)। `npm-check-updates` के साथ नवीनतम संस्करणों को हल करता है, वर्कस्पेस रूट से स्थापित करता है, और केवल उन अपग्रेड को रखता है जो प्रत्येक पैकेज के `typecheck`/`lint` को पार करते हैं (पीयर गेट्स पिन `eslint` / `typescript` जब लिंट स्टैक नवीनतम मुख्य की अनुमति नहीं देता है)। फिर `pnpm audit` / `audit --fix` चलाता है और कोड परिवर्तन की आवश्यकता वाले किसी भी सुरक्षा सुधार को बलपूर्वक लागू (और रिपोर्ट) करता है। वर्कस्पेस लॉकफ़ाइल और ब्राउज़रसूचि को ताज़ा करता है। अपने शेल पर **nvm** लागू करने के लिए `source ./scripts/upgrade-dependencies.sh` को प्राथमिकता दें; CI या स्वचालन में फ़ाइल को सीधे निष्पादित करते समय `CI=1` या `UPGRADE_ALLOW_EXEC=1` का उपयोग करें। केवल Node/pnpm टूलिंग के लिए `scripts/upgrade-tools.sh` भी देखें।
- `scripts/clean-workspace.sh` - वर्कस्पेस साफ़ करें
- `pnpm i18n:tools --local` / `--remote` — एक सहोदर `ai-i18n-tools` चेकआउट लिंक करें या नवीनतम npm पैकेज पुनर्स्थापित करें (`scripts/link-ai-i18n-tools.sh`)। `link:` स्पेसिफ़ायर को प्रतिबद्ध न करें।

**नोट:** `preinstall` स्क्रिप्ट स्वचालित रूप से pnpm को पैकेज प्रबंधक के रूप में लागू करता है।

### प्रलेखन स्क्रिप्ट्स {/* #documentation-scripts */}

इन स्क्रिप्ट्स को `documentation/` निर्देशिका से चलाना चाहिए:

- `pnpm start` - उत्पादन मोड में प्रलेखन साइट बनाएं और सर्व करें (डिफ़ॉल्ट रूप से पोर्ट 3000)
- `pnpm start:en` - अंग्रेजी में प्रलेखन विकास सर्वर प्रारंभ करें (हॉट रीलोडिंग सक्षम)
- `pnpm start:fr` - फ्रेंच स्थानीयकरण में प्रलेखन विकास सर्वर प्रारंभ करें (हॉट रीलोडिंग सक्षम)
- `pnpm start:de` - जर्मन स्थानीयकरण में प्रलेखन विकास सर्वर प्रारंभ करें (हॉट रीलोडिंग सक्षम)
- `pnpm start:es` - स्पेनिश स्थानीयकरण में प्रलेखन विकास सर्वर प्रारंभ करें (हॉट रीलोडिंग सक्षम)
- `pnpm start:pt-br` - पुर्तगाली (ब्राजील) स्थानीयकरण में प्रलेखन विकास सर्वर प्रारंभ करें (हॉट रीलोडिंग सक्षम)
- `pnpm build` - उत्पादन के लिए प्रलेखन साइट बनाएं
- `pnpm write-translations` - प्रलेखन से अनुवाद योग्य स्ट्रिंग्स निकालें
- `pnpm translate` - AI का उपयोग करके प्रलेखन फ़ाइलें अनुवादित करें ([अनुवाद कार्यप्रवाह](translation-workflow) देखें)
- `pnpm lint` - प्रलेखन स्रोत फ़ाइलों पर ESLint चलाएं

विकास सर्वर (`start:*`) त्वरित विकास के लिए हॉट मॉड्यूल प्रतिस्थापन प्रदान करते हैं। डिफ़ॉल्ट पोर्ट 3000 है।

### उत्पादन स्क्रिप्ट्स {/* #production-scripts */}
- `pnpm build-local` - स्थानीय उत्पादन के लिए बनाएं और तैयार करें (प्री-चेक सहित, स्थैतिक फ़ाइलों को स्टैंडअलोन निर्देशिका में कॉपी करें)
- `pnpm start-local` - स्थानीय रूप से उत्पादन सर्वर प्रारंभ करें (पोर्ट 8666, प्री-चेक सहित)। **नोट:** पहले `pnpm build-local` चलाएं। `--require ./scripts/peer-ip.cjs` के साथ स्टैंडअलोन सर्वर प्रारंभ करता है।
- `pnpm start` - उत्पादन सर्वर (पोर्ट 9666) उसी पीयर-IP प्रीलोड के साथ प्रारंभ करें। डॉकर `docker-entrypoint.sh` का उपयोग करके उसी स्क्रिप्ट को लोड करता है।

### डॉकर स्क्रिप्ट्स {/* #docker-scripts */}
- `pnpm docker:up` - डॉकर कंपोज स्टैक प्रारंभ करें
- `pnpm docker:down` - डॉकर कंपोज स्टैक बंद करें
- `pnpm docker:clean` - डॉकर वातावरण और कैश साफ़ करें
- `pnpm docker:devel` - एक विकास डॉकर छवि बनाएं जिसे `wsj-br/duplistatus:devel` के रूप में टैग किया गया है

### क्रॉन सेवा स्क्रिप्ट्स {/* #cron-service-scripts */}
- `pnpm cron:start` - उत्पादन मोड में क्रॉन सेवा प्रारंभ करें
- `pnpm cron:dev` - विकास मोड में केवल क्रॉन सेवा फ़ाइल देखने के साथ प्रारंभ करें (पोर्ट 8667)। आमतौर पर अनावश्यक जब `pnpm dev` का उपयोग कर रहे हों, जो पहले से क्रॉन शुरू करता है।
- `pnpm cron:start-local` - परीक्षण के लिए स्थानीय रूप से क्रॉन सेवा प्रारंभ करें (पोर्ट 8667)

### परीक्षण स्क्रिप्ट्स {/* #test-scripts */}
- `pnpm generate-test-data` - परीक्षण बैकअप डेटा उत्पन्न करें (--servers=N पैरामीटर की आवश्यकता है)
- `pnpm validate-csv-export` - CSV निर्यात कार्यक्षमता को मान्य करें
- `pnpm test-entrypoint` - स्थानीय विकास में डॉकर एंट्रीपॉइंट स्क्रिप्ट का परीक्षण करें ([परीक्षण स्क्रिप्ट्स](test-scripts) देखें)
- `pnpm take-screenshots` - प्रलेखन के लिए स्क्रीनशॉट लें ([प्रलेखन उपकरण](documentation-tools) देखें)

अतिदेय जांच, क्रॉन स्वास्थ्य जांच और SMTP परीक्षण चल रहे एप्लिकेशन और `curl` के माध्यम से किया जाता है ([परीक्षण स्क्रिप्ट्स](test-scripts) देखें); उनके लिए पुराने स्टैंडअलोन `pnpm` सहायक हटा दिए गए थे।
