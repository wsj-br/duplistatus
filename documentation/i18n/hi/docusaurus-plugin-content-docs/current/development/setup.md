# डेवलपमेंट सेटअप {/* #development-setup */}

## पूर्वापेक्षाएँ {/* #prerequisites */}

- Docker / Docker Compose
- Node.js (`package.json` में `engines.node` देखें)
- pnpm (`package.json` में `engines.pnpm` / `packageManager` देखें)
- SQLite3
- Inkscape (डॉक्युमेंटेशन SVG अनुवाद और PNG एक्सपोर्ट के लिए; केवल तभी आवश्यक है यदि आप `translate` या `translate:svg` चलाते हैं)
- bat/batcat (`translate:help` का सुंदर संस्करण दिखाएँ)
- direnv (`.env*` फ़ाइलें स्वचालित रूप से लोड करने के लिए)
- Playwright Chromium (`pnpm install` के बाद `pnpm take-screenshots:install` चलाएं; यह `playwright install chromium` चलाता है)

## चरण {/* #steps */}

### 1. रिपॉजिटरी क्लोन करें: {/* #1-clone-the-repository */}

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

### 2. डिपेंडेंसीज़ इंस्टॉल करें (Debian/Ubuntu): {/* #2-install-dependencies-debianubuntu */}

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    sudo apt install -y build-essential python3 python3-dev python3-setuptools make g++ gcc pkg-config 
    ```

### 3. पुराने Node.js इंस्टॉलेशन हटाएं (यदि यह पहले से इंस्टॉल है) {/* #3-remove-old-nodejs-installations-if-you-already-have-it-installed */}

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

### 4. Node.js और pnpm इंस्टॉल करें: {/* #4-install-nodejs-and-pnpm */}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm config set allow-scripts=pnpm --location=user
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. direnv सपोर्ट सेट अप करें {/* #5-set-up-direnv-support */}

अपनी `~/.bashrc` फ़ाइल में ये पंक्तियाँ जोड़ें

    ```bash 
    # direnv support (apt install direnv)
    eval "$(direnv hook bash)"
    ```

इस कमांड के साथ:

    ```bash 
    (echo "# direnv support (apt install direnv)"; echo 'eval "$(direnv hook bash)') >> ~/.bashrc
    ```

रिपॉजिटरी basedir में, चलाएं:

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
  इन परिवर्तनों के प्रभावी होने के लिए आपको टर्मिनल को फिर से खोलना होगा या कोड एडिटर IDE (Visual Studio Code, 
  Cursor, Lingma, Antigravity, Zed, ...) को बंद करें/फिर से खोलना पड़ सकता है।
:::

### 6. रिपॉजिटरी basedir में इन वेरिएबल्स के साथ `.env` फ़ाइल बनाएँ। {/* #6-create-the-env-file-at-the-repository-basedir-with-these-variables */}

- आप `VERSION` के लिए किसी भी मान का उपयोग कर सकते हैं; डेवलपमेंट स्क्रिप्ट्स का उपयोग करते समय यह स्वचालित रूप से अपडेट हो जाएगा।
- `ADMIN_PASSWORD` और `USER_PASSWORD` के लिए रैंडम पासवर्ड का उपयोग करें; इन पासवर्ड्स का उपयोग `pnpm take-screenshots` स्क्रिप्ट में किया जाएगा।
- आप [openrouter.ai](https://openrouter.ai) से `OPENROUTER_API_KEY` प्राप्त कर सकते हैं।

    ```bash
    VERSION=x.x.x

    # Development user passwords
    ADMIN_PASSWORD="admin_secret"
    USER_PASSWORD="user_secret"


    # Openrouter.ai API key for translation scripts in documentation 
    OPENROUTER_API_KEY=sk-or-v1-your-key-for-translate-files
    ```

## उपलब्ध स्क्रिप्ट्स {/* #available-scripts */}

प्रोजेक्ट में विभिन्न डेवलपमेंट कार्यों के लिए कई npm स्क्रिप्ट्स शामिल हैं:

### विकास स्क्रिप्ट {/* #development-scripts */}
- `pnpm dev` - Next.js विकास सर्वर (पोर्ट 8666) और क्रॉन सेवा (पोर्ट 8667) को `concurrently` के माध्यम से एक साथ शुरू करें (पूर्व-जांच शामिल)। CTRL-C दोनों को बंद करता है। `NODE_OPTIONS` के लिए Next.js `scripts/dev-preload.cjs` लोड करता है, जो `scripts/peer-ip.cjs` (IP अनुमति सूचियों के लिए TCP पीयर पता) और अनुरोध-लॉग टाइमस्टैम्प लागू करता है।
- `pnpm dev:next` - केवल Next.js विकास सर्वर को पोर्ट 8666 पर शुरू करें (कोई क्रॉन नहीं)।
- `pnpm build` - उत्पादन के लिए एप्लिकेशन बनाएं (पूर्व-जांच शामिल)
- `pnpm lint` - कोड गुणवत्ता जांचने के लिए ESLint चलाएं
- `pnpm typecheck` - TypeScript प्रकार जांच चलाएं
- `scripts/upgrade-dependencies.sh` — प्रत्येक कार्यक्षेत्र पैकेज का बिल्ड-सुरक्षित अपग्रेड (स्वचालित-पहचान)। `npm-check-updates` के साथ नवीनतम संस्करणों को हल करता है, कार्यक्षेत्र रूट से स्थापित करता है, और केवल उन अपग्रेड को रखता है जो प्रत्येक पैकेज के `typecheck`/`lint` को पास करते हैं (पीयर गेट `eslint` / `typescript` को पिन करते हैं जब लिंट स्टैक नवीनतम प्रमुख की अनुमति नहीं देता)। फिर `pnpm audit` / `audit --fix` चलाता है और किसी भी सुरक्षा सुधार को बल-लागू करता है (और रिपोर्ट करता है) जिसे कोड परिवर्तन की आवश्यकता है। कार्यक्षेत्र लॉकफ़ाइल और ब्राउज़रलिस्ट को ताज़ा करता है। `source ./scripts/upgrade-dependencies.sh` को प्राथमिकता दें ताकि **nvm** आपके शेल पर लागू हो; CI या स्वचालन में फ़ाइल को सीधे निष्पादित करते समय `CI=1` या `UPGRADE_ALLOW_EXEC=1` का उपयोग करें। Node/pnpm टूलिंग के लिए `scripts/upgrade-tools.sh` भी देखें।
- `scripts/clean-workspace.sh` - कार्यक्षेत्र को साफ़ करें

**नोट:** `preinstall` स्क्रिप्ट स्वचालित रूप से pnpm को पैकेज प्रबंधक के रूप में लागू करती है।

### दस्तावेज़ स्क्रिप्ट {/* #documentation-scripts */}

ये स्क्रिप्ट `documentation/` निर्देशिका से चलाई जानी चाहिए:

- `pnpm start` - दस्तावेज़ साइट को उत्पादन मोड में बनाएं और सेवा करें (डिफ़ॉल्ट रूप से पोर्ट 3000)
- `pnpm start:en` - अंग्रेजी में दस्तावेज़ विकास सर्वर शुरू करें (हॉट रीलोडिंग सक्षम)
- `pnpm start:fr` - फ्रेंच लोकेल में दस्तावेज़ विकास सर्वर शुरू करें (हॉट रीलोडिंग सक्षम)
- `pnpm start:de` - जर्मन लोकेल में दस्तावेज़ विकास सर्वर शुरू करें (हॉट रीलोडिंग सक्षम)
- `pnpm start:es` - स्पेनिश लोकेल में दस्तावेज़ विकास सर्वर शुरू करें (हॉट रीलोडिंग सक्षम)
- `pnpm start:pt-br` - पुर्तगाली (ब्राज़ील) लोकेल में दस्तावेज़ विकास सर्वर शुरू करें (हॉट रीलोडिंग सक्षम)
- `pnpm build` - उत्पादन के लिए दस्तावेज़ साइट बनाएं
- `pnpm write-translations` - दस्तावेज़ से अनुवादयोग्य स्ट्रिंग निकालें
- `pnpm translate` - AI का उपयोग करके दस्तावेज़ फ़ाइलों का अनुवाद करें ([अनुवाद वर्कफ़्लो](translation-workflow) देखें)
- `pnpm lint` - दस्तावेज़ स्रोत फ़ाइलों पर ESLint चलाएं

विकास सर्वर (`start:*`) तेजी से विकास के लिए हॉट मॉड्यूल प्रतिस्थापन प्रदान करते हैं। डिफ़ॉल्ट पोर्ट 3000 है।

### उत्पादन स्क्रिप्ट {/* #production-scripts */}
- `pnpm build-local` - स्थानीय उत्पादन के लिए बनाएं और तैयार करें (पूर्व-जांच शामिल, स्थिर फ़ाइलों को स्टैंडअलोन निर्देशिका में कॉपी करता है)
- `pnpm start-local` - स्थानीय रूप से उत्पादन सर्वर शुरू करें (पोर्ट 8666, पूर्व-जांच शामिल)। **नोट:** पहले `pnpm build-local` चलाएं। `--require ./scripts/peer-ip.cjs` के साथ स्टैंडअलोन सर्वर शुरू करता है।
- `pnpm start` - उत्पादन सर्वर शुरू करें (पोर्ट 9666) समान पीयर-ip प्रीलोड के साथ। Docker `docker-entrypoint.sh` का उपयोग करके समान स्क्रिप्ट लोड करता है।

### Docker स्क्रिप्ट {/* #docker-scripts */}
- `pnpm docker:up` - Docker Compose स्टैक शुरू करें
- `pnpm docker:down` - Docker Compose स्टैक बंद करें
- `pnpm docker:clean` - Docker वातावरण और कैश को साफ़ करें
- `pnpm docker:devel` - `wsj-br/duplistatus:devel` के रूप में टैग किए गए विकास Docker इमेज को बनाएं

### क्रॉन सेवा स्क्रिप्ट {/* #cron-service-scripts */}
- `pnpm cron:start` - उत्पादन मोड में क्रॉन सेवा शुरू करें
- `pnpm cron:dev` - फ़ाइल निरीक्षण के साथ विकास मोड में केवल क्रॉन सेवा शुरू करें (पोर्ट 8667)। आमतौर पर `pnpm dev` का उपयोग करते समय अनावश्यक, जो पहले से ही क्रॉन शुरू करता है।
- `pnpm cron:start-local` - परीक्षण के लिए स्थानीय रूप से क्रॉन सेवा शुरू करें (पोर्ट 8667)

### परीक्षण स्क्रिप्ट {/* #test-scripts */}
- `pnpm generate-test-data` - परीक्षण बैकअप डेटा उत्पन्न करें (--servers=N पैरामीटर की आवश्यकता है)
- `pnpm validate-csv-export` - CSV निर्यात कार्यक्षमता को सत्यापित करें
- `pnpm test-entrypoint` - स्थानीय विकास में Docker प्रवेशबिंदु स्क्रिप्ट का परीक्षण करें ([परीक्षण स्क्रिप्ट](test-scripts) देखें)
- `pnpm take-screenshots` - दस्तावेज़ के लिए स्क्रीनशॉट लें ([दस्तावेज़ उपकरण](documentation-tools) देखें)

अतिदेय जांच, क्रॉन स्वास्थ्य जांच, और SMTP परीक्षण चलती एप्लिकेशन और `curl` के माध्यम से किए जाते हैं ([परीक्षण स्क्रिप्ट](test-scripts) देखें); उन के लिए पुरानी स्टैंडअलोन `pnpm` सहायक को हटा दिया गया था।
