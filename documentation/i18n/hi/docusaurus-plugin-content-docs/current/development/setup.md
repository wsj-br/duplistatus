# विकास सेटअप {/* #development-setup */}

## आवश्यक शर्तें {/* #prerequisites */}

- Docker / Docker Compose
- Node.js (देखें `engines.node` में `package.json`)
- pnpm (देखें `engines.pnpm` / `packageManager` में `package.json`)
- SQLite3
- Inkscape (for documentation SVG translation and PNG export; required only if you run `translate` or `translate:svg`)
- bat/batcat (to show a pretty version of the `translate:help`)
- direnv (to automatically load the `.env*` files)
- Playwright Chromium (run `pnpm take-screenshots:install` after `pnpm install`; this runs `playwright install chromium`)

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

### 3. पुरानी Node.js इंस्टॉलेशन हटाएँ (यदि पहले से इंस्टॉल है) {/* #3-remove-old-nodejs-installations-if-you-already-have-it-installed */}

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

### 4. Node.js aur pnpm इंस्टॉल करें: {/* #4-install-nodejs-and-pnpm */}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm config set allow-scripts=pnpm --location=user
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. direnv सपोर्ट सेट अप करें {/* #5-set-up-direnv-support */}

अपने `~/.bashrc` फ़ाइल में ये लाइनों जोड़ें

    ```bash 
    # direnv support (apt install direnv)
    eval "$(direnv hook bash)"
    ```

इस कमांड के साथ:

    ```bash 
    (echo "# direnv support (apt install direnv)"; echo 'eval "$(direnv hook bash)') >> ~/.bashrc
    ```

रिपॉजिटरी आधार निर्देशिका में, चलाएं:

    ```bash
    direnv allow
    ```

अपने `~/.profile` फ़ाइल में ये लाइनों जोड़ें

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
  इन परिवर्तनों को प्रभावी बनाने के लिए आपको टर्मिनल को पुनः खोलना होगा या कोड एडिटर आईडीई (Visual Studio Code, 
  Cursor, Lingma, Antigravity, Zed, ...) को बंद/पुनः खोलना होगा।
:::

### 6. रिपॉजिटरी के बेसडायरेक्टरी में इन वेरिएबल्स के साथ `.env` फ़ाइल बनाएँ। {/* #6-create-the-env-file-at-the-repository-basedir-with-these-variables */}

- आप `VERSION` के लिए कोई भी मान उपयोग कर सकते हैं; इसे विकास स्क्रिप्ट्स का उपयोग करते समय स्वचालित रूप से अपडेट किया जाएगा।
- `ADMIN_PASSWORD` और `USER_PASSWORD` के लिए यादृच्छिक पासवर्ड उपयोग करें; ये पासवर्ड `pnpm take-screenshots` स्क्रिप्ट में उपयोग किए जाएंगे।
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

प्रोजेक्ट में विभिन्न विकास कार्यों के लिए कई npm स्क्रिप्ट शामिल हैं:

### डेवलपमेंट स्क्रिप्ट्स {/* #development-scripts */}
- `pnpm dev` - `concurrently` के माध्यम से Next.js डेवलपमेंट सर्वर (Port 8666) aur क्रॉन सेवा (Port 8667) एक साथ शुरू करें (प्री-चेक शामिल)। CTRL-C दोनों को रोकता है। Next.js के लिए `NODE_OPTIONS` `scripts/dev-preload.cjs` को लोड करता है, जो `scripts/peer-ip.cjs` (IP अलाउलिस्ट्स के लिए TCP पीयर पता) aur अनुरोध-लॉग टाइमस्टैम्प्स लागू करता है।
- `pnpm dev:next` - केवल Port 8666 पर Next.js डेवलपमेंट सर्वर शुरू करें (कोई क्रॉन नहीं)।
- `pnpm build` - एप्लिकेशन को प्रोडक्शन के लिए बिल्ड करें (प्री-चेक शामिल)
- `pnpm lint` - कोड गुणवत्ता की जाँच करने के लिए ESLint चलाएँ
- `pnpm typecheck` - TypeScript प्रकार जाँच चलाएँ
- `scripts/upgrade-dependencies.sh` — प्रत्येक कार्यक्षेत्र पैकेज का निर्माण-सुरक्षित उन्नयन (स्वतः पहचान किया गया)। `npm-check-updates` के साथ नवीनतम संस्करणों को हल करता है, कार्यक्षेत्र की जड़ से स्थापित करता है, और केवल उन उन्नयन को रखता है जो प्रत्येक पैकेज के `typecheck`/`lint` (पीयर गेट्स पिन `eslint` / `typescript` जब लिंट स्टैक नवीनतम प्रमुख की अनुमति नहीं देता) को पास करते हैं। फिर `pnpm audit` / `audit --fix` चलाता है और किसी भी सुरक्षा सुधार को बलपूर्वक लागू करता है (और रिपोर्ट करता है) जिसे कोड परिवर्तनों की आवश्यकता होती है। कार्यक्षेत्र लॉकफ़ाइल और ब्राउज़र सूची को ताज़ा करता है। `source ./scripts/upgrade-dependencies.sh` को प्राथमिकता दें ताकि **nvm** आपके शेल पर लागू हो; CI या स्वचालन में फ़ाइल को सीधे निष्पादित करते समय `CI=1` या `UPGRADE_ALLOW_EXEC=1` का उपयोग करें। केवल Node/pnpm उपकरणों के लिए `scripts/upgrade-tools.sh` भी देखें।
- `scripts/clean-workspace.sh` - कार्यक्षेत्र को साफ करें

**Note:** `preinstall` स्क्रिप्ट स्वचालित रूप से pnpm को पैकेज मैनेजर के रूप में लागू करता है।

### डॉक्यूमेंटेशन स्क्रिप्ट्स {/* #documentation-scripts */}

ये स्क्रिप्ट `documentation/` निर्देशिका से चलानी चाहिए:

- `pnpm start` - उत्पादन मोड में दस्तावेज़ साइट बनाएं और सेवा करें (डिफ़ॉल्ट पोर्ट 3000)
- `pnpm start:en` - अंग्रेजी में दस्तावेज़ विकास सर्वर शुरू करें (हॉट रीलोडिंग सक्षम)
- `pnpm start:fr` - फ्रेंच लोकेल में दस्तावेज़ विकास सर्वर शुरू करें (हॉट रीलोडिंग सक्षम)
- `pnpm start:de` - जर्मन लोकेल में दस्तावेज़ विकास सर्वर शुरू करें (हॉट रीलोडिंग सक्षम)
- `pnpm start:es` - स्पेनिश लोकेल में दस्तावेज़ विकास सर्वर शुरू करें (हॉट रीलोडिंग सक्षम)
- `pnpm start:pt-br` - पुर्तगाली (ब्राज़ील) लोकेल में दस्तावेज़ विकास सर्वर शुरू करें (हॉट रीलोडिंग सक्षम)
- `pnpm build` - उत्पादन के लिए दस्तावेज़ साइट बनाएं
- `pnpm write-translations` - दस्तावेज़ से अनुवाद योग्य स्ट्रिंग्स निकालें
- `pnpm translate` - AI का उपयोग करके दस्तावेज़ फ़ाइलें अनुवाद करें ( [अनुवाद कार्यप्रवाह](translation-workflow) देखें)
- `pnpm lint` - दस्तावेज़ स्रोत फ़ाइलों पर ESLint चलाएं

विकास सर्वर (`start:*`) त्वरित विकास के लिए हॉट मॉड्यूल रिप्लेसमेंट प्रदान करते हैं। डिफ़ॉल्ट पोर्ट 3000 है।

### प्रोडक्शन स्क्रिप्ट्स {/* #production-scripts */}
- `pnpm build-local` - लोकल प्रोडक्शन के लिए बिल्ड और तैयारी करें (प्री-चेक शामिल, स्टैटिक फ़ाइलों को स्टैंडअलोन डायरेक्टरी में कॉपी करता है)
- `pnpm start-local` - स्थानीय रूप से प्रोडक्शन सर्वर शुरू करें (Port 8666, प्री-चेक शामिल)। **Note:** पहले `pnpm build-local` चलाएँ। `--require ./scripts/peer-ip.cjs` के साथ स्टैंडअलोन सर्वर शुरू करता है।
- `pnpm start` - उसी पीयर-आईपी प्रीलोड के साथ प्रोडक्शन सर्वर (Port 9666) शुरू करें। Docker `docker-entrypoint.sh` का उपयोग उसी स्क्रिप्ट को लोड करने के लिए करता है।

### Docker स्क्रिप्ट्स {/* #docker-scripts */}
- `pnpm docker:up` - Docker Compose स्टैक शुरू करें
- `pnpm docker:down` - Docker Compose स्टैक रोकें
- `pnpm docker:clean` - Docker एनवायरनमेंट aur कैश साफ़ करें
- `pnpm docker:devel` - `wsj-br/duplistatus:devel` के रूप में टैग किया गया विकास डॉकर इमेज बनाएं

### क्रॉन सेवा स्क्रिप्ट्स {/* #cron-service-scripts */}
- `pnpm cron:start` - क्रॉन सेवा को प्रोडक्शन मोड में शुरू करें
- `pnpm cron:dev` - फ़ाइल वॉचिंग के साथ केवल क्रॉन सेवा को डेवलपमेंट मोड में शुरू करें (Port 8667)। `pnpm dev` का उपयोग करते समय आमतौर पर अनावश्यक, जो पहले से क्रॉन शुरू करता है।
- `pnpm cron:start-local` - Parikshan के लिए स्थानीय रूप से क्रॉन सेवा शुरू करें (Port 8667)

### Parikshan स्क्रिप्ट्स {/* #test-scripts */}
- `pnpm generate-test-data` - बैकअप Parikshan डेटा जनरेट करें (--servers=N पैरामीटर आवश्यक)
- `pnpm validate-csv-export` - CSV एक्सपोर्ट कार्यक्षमता को वैलिडेट करें
- `pnpm test-entrypoint` - स्थानीय डेवलपमेंट में Docker एंट्रीपॉइंट स्क्रिप्ट का Parikshan करें ([Parikshan स्क्रिप्ट्स](test-scripts) देखें)
- `pnpm take-screenshots` - दस्तावेज़ के लिए स्क्रीनशॉट लें ( [दस्तावेज़ टूल](documentation-tools) देखें)

विलंबित चेक, क्रॉन स्वास्थ्य चेक, और SMTP परीक्षण चल रहे एप्लिकेशन और `curl` के माध्यम से किए जाते हैं ( [परीक्षण स्क्रिप्ट](test-scripts) देखें); उनके लिए पुराने स्टैंडअलोन `pnpm` हेल्पर्स को हटा दिया गया था।
