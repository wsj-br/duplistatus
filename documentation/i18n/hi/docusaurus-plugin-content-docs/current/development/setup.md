# विकास सेटअप {#development-setup}

## पूर्वापेक्षाएँ {#prerequisites}

- Docker / Docker Compose
- Node.js (देखें `engines.node` में `package.json`)
- pnpm (देखें `engines.pnpm` / `packageManager` में `package.json`)
- SQLite3
- Inkscape (दस्तावेज़ SVG अनुवाद और PNG निर्यात के लिए; केवल तब आवश्यक जब आप `translate` या `translate:svg` चलाते हैं)
- bat/batcat (`translate:help` का सुंदर संस्करण दिखाने के लिए)
- direnv (`.env*` फ़ाइलें स्वचालित रूप से लोड करने के लिए)

## कदम {#steps}

### 1. रिपॉजिटरी को क्लोन करें: {#1-clone-the-repository}

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

### 2. निर्भरताएँ स्थापित करें (Debian/Ubuntu के लिए): {#2-install-dependencies-debianubuntu}

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    ```

### 3. पुराने Node.js स्थापनाओं को हटाएं (यदि आपने पहले से ही इसे स्थापित किया है) {#3-remove-old-nodejs-installations-if-you-already-have-it-installed}

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

### 4. Node.js और pnpm स्थापित करें: {#4-install-nodejs-and-pnpm}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. direnv समर्थन सेट करें {#5-set-up-direnv-support}

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

### 6. रिपॉजिटरी आधार निर्देशिका पर `.env` फ़ाइल बनाएं इन चर के साथ। {#6-create-the-env-file-at-the-repository-basedir-with-these-variables}

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

## उपलब्ध स्क्रिप्ट्स {#available-scripts}

प्रोजेक्ट में विभिन्न विकास कार्यों के लिए कई npm स्क्रिप्ट शामिल हैं:

### विकास स्क्रिप्ट {#development-scripts}
- `pnpm dev` - पोर्ट 8666 पर विकास सर्वर शुरू करें (पूर्व-चेक शामिल हैं)
- `pnpm build` - उत्पादन के लिए एप्लिकेशन बनाएं (पूर्व-चेक शामिल हैं)
- `pnpm lint` - कोड गुणवत्ता की जाँच के लिए ESLint चलाएं
- `pnpm typecheck` - TypeScript प्रकार की जाँच चलाएं
- `scripts/upgrade-dependencies.sh` — हर वर्कस्पेस पैकेज का सुरक्षित अपग्रेड करें (स्वचालित-निर्धारित)। नवीनतम संस्करणों को `npm-check-updates` के साथ हल करें, वर्कस्पेस रूट से इंस्टॉल करें, और केवल उन अपग्रेड को रखें जो प्रत्येक पैकेज के `typecheck`/`lint` (पीयर गेट्स `eslint` / `typescript` को पिन करते हैं जब लिंट स्टैक नवीनतम मेजर को अनुमति नहीं देता है) को पास करते हैं। फिर `pnpm audit` / `audit --fix` चलाएं और किसी भी सुरक्षा फिक्स को जो कोड परिवर्तन की आवश्यकता है, बलपूर्वक लागू करें (और रिपोर्ट करें)। वर्कस्पेस लॉकफाइल और ब्राउज़र्सलिस्ट को ताज़ा करें। **nvm** आपके शेल के लिए लागू होने के लिए `source ./scripts/upgrade-dependencies.sh` का प्राथमिकता दें; CI या ऑटोमेशन में, फ़ाइल को सीधे चलाने के समय `CI=1` या `UPGRADE_ALLOW_EXEC=1` का उपयोग करें। Node/pnpm टूलिंग के लिए `scripts/upgrade-tools.sh` देखें।
- `scripts/clean-workspace.sh` - वर्कस्पेस को साफ़ करें

**Note:** `preinstall` स्क्रिप्ट स्वचालित रूप से pnpm को पैकेज मैनेजर के रूप में लागू करता है।

### दस्तावेज़ स्क्रिप्ट {#documentation-scripts}

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

### उत्पादन स्क्रिप्ट {#production-scripts}
- `pnpm build-local` - स्थानीय उत्पादन के लिए बनाएं और तैयार करें (पूर्व-चेक शामिल हैं, स्टैटिक फ़ाइलें स्टैंडअलोन निर्देशिका में कॉपी करें)
- `pnpm start-local` - स्थानीय रूप से उत्पादन सर्वर शुरू करें (पोर्ट 8666, पूर्व-चेक शामिल हैं)। **Note:** पहले `pnpm build-local` चलाएं।
- `pnpm start` - उत्पादन सर्वर शुरू करें (पोर्ट 9666)

### डॉकर स्क्रिप्ट {#docker-scripts}
- `pnpm docker:up` - डॉकर कॉम्पोज स्टैक शुरू करें
- `pnpm docker:down` - डॉकर कॉम्पोज स्टैक रोकें
- `pnpm docker:clean` - डॉकर वातावरण और कैश को साफ़ करें
- `pnpm docker:devel` - `wsj-br/duplistatus:devel` के रूप में टैग किया गया विकास डॉकर इमेज बनाएं

### क्रॉन सेवा स्क्रिप्ट {#cron-service-scripts}
- `pnpm cron:start` - उत्पादन मोड में क्रॉन सेवा शुरू करें
- `pnpm cron:dev` - फ़ाइल वॉचिंग के साथ विकास मोड में क्रॉन सेवा शुरू करें (पोर्ट 8667)
- `pnpm cron:start-local` - परीक्षण के लिए स्थानीय रूप से क्रॉन सेवा शुरू करें (पोर्ट 8667)

### परीक्षण स्क्रिप्ट {#test-scripts}
- `pnpm generate-test-data` - परीक्षण बैकअप डेटा जनरेट करें (--servers=N पैरामीटर की आवश्यकता है)
- `pnpm validate-csv-export` - CSV निर्यात कार्यक्षमता को सत्यापित करें
- `pnpm test-entrypoint` - स्थानीय विकास में डॉकर एंट्रीपॉइंट स्क्रिप्ट का परीक्षण करें ( [परीक्षण स्क्रिप्ट](test-scripts) देखें)
- `pnpm take-screenshots` - दस्तावेज़ के लिए स्क्रीनशॉट लें ( [दस्तावेज़ टूल](documentation-tools) देखें)

विलंबित चेक, क्रॉन स्वास्थ्य चेक, और SMTP परीक्षण चल रहे एप्लिकेशन और `curl` के माध्यम से किए जाते हैं ( [परीक्षण स्क्रिप्ट](test-scripts) देखें); उनके लिए पुराने स्टैंडअलोन `pnpm` हेल्पर्स को हटा दिया गया था।
