# AI Tools {#how-i-build-this-application-using-ai-tools} ka Upyog Karke Main Is Application Ko Kaise Build Karoon

# Prerna {#motivation}

Maine apne home server ke liye backup tool ke roop mein Duplicati ka upyog shuru kiya. Maine official [Duplicati dashboard](https://app.duplicati.com/) aur [Duplicati Monitoring](https://www.duplicati-monitoring.com/) ko try kiya, lekin meri do mukhya avashyaktaayein thi: (1) self-hosted; aur (2) [Homepage](https://gethomepage.dev/) ke saath integration ke liye ek API expose karna, kyunki main ise apne home lab ke homepage ke liye upyog karta hoon.

Maine network par har Duplicati server se seedhe judne ki bhi koshish ki, lekin authentication vidhi Homepage ke saath compatible nahi thi (ya main ise theek se configure nahi kar paya).

Jabki main AI code tools ke saath bhi prayog kar raha tha, maine is tool ko build karne ke liye AI ka upyog karne ka faisla kiya. Yahan woh prakriya hai jo maine upyog ki...

# Upyog Kiye Gaye Tools {#tools-used}

1. UI ke liye: [Google's Firebase Studio](https://firebase.studio/)
2. Implementation ke liye: Cursor (https://www.cursor.com/)

:::note
Maine UI ke liye Firebase ka upyog kiya, lekin aap [v0.app](https://v0.app/) ya kisi anya tool ka upyog karke prototype bhi generate kar sakte hain. Maine implementation generate karne ke liye Cursor ka upyog kiya, lekin aap anya tools jaise VS Code/Copilot, Windsurf, ... ka upyog kar sakte hain.
:::

# UI {#ui}

Maine [Firebase Studio](https://studio.firebase.google.com/) mein ek naya project banaya aur "Prototype an app with AI" feature mein yeh prompt upyog kiya:

> Tailwind/React ka upyog karke ek web dashboard application jo kai machines se Duplicati backup solution dwara bheje gaye backup result ko ek sqllite3 database mein consolidate kare, backup ki stithi, aakar, upload aakar ko track kare.
> 
> Dashboard ke pehle page par har machine ke antim backup ki ek table honi chahiye, jismein machine ka naam, database mein store kiye gaye backups ki sankhya, antim backup stithi, avadhi (hh:mm:ss), chetaavaniyon aur trutiyon ki sankhya shamil ho.
> 
> Jab kisi machine ki row par click kiya jaye, to select ki gayi machine ka ek detail page dikhaye jismein store kiye gaye backups ki ek list (paginated) ho, jisme backup ka naam, backup ki taareekh aur samay, kitni der pehle hua, stithi, chetaavaniyon aur trutiyon ki sankhya, files ki sankhya, files ka aakar, upload kiya gaya aakar aur storage ka kul aakar shamil ho. Detail page mein Tremor ka upyog karke ek chart bhi shamil kare jismein fields ka vikas dikhaye: upload kiya gaya aakar; minutes mein avadhi, examine ki gayi files ki sankhya, examine ki gayi files ka aakar. Chart ko ek samay mein ek field plot karna chahiye, jise plot karne ke liye desired field select karne ke liye ek dropbox ho. Chart mein database mein store kiye gaye sabhi backups ko bhi dikhana chahiye, na ki sirf unhe jo paginated table mein dikh rahe hain.
> 
> Application ko Duplicati server se post receive karne ke liye ek API endpoint aur machine ke antim backup ke sabhi vivaran ko JSON ke roop mein retrieve karne ke liye ek aur API endpoint expose karna chahiye.
> 
> Design modern, responsive hona chahiye aur icons aur anya visual aids shamil hone chahiye jisse padhna aasan ho. Code saaf, sankshipt aur maintain karne mein aasan hona chahiye. Dependencies ko handle karne ke liye pnpm jaise modern tools ka upyog karein.
> 
> Application mein user dwara select ki jaane wali dark aur light theme honi chahiye.
> 
> Database ko Duplicati JSON dwara prapt kiye gaye yeh fields store karne chahiye:

```json
"{ "Data": { "DeletedFiles": 0, "DeletedFolders": 0, "ModifiedFiles": 0, "ExaminedFiles": 15399, "OpenedFiles": 1861, "AddedFiles": 1861, "SizeOfModifiedFiles": 0, "SizeOfAddedFiles": 13450481, "SizeOfExaminedFiles": 11086692615, "SizeOfOpenedFiles": 13450481, "NotProcessedFiles": 0, "AddedFolders": 419, "TooLargeFiles": 0, "FilesWithError": 0, "ModifiedFolders": 0, "ModifiedSymlinks": 0, "AddedSymlinks": 0, "DeletedSymlinks": 0, "PartialBackup": false, "Dryrun": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "EndTime": "2025-04-21T23:46:38.3568274Z", "BeginTime": "2025-04-21T23:45:46.9712217Z", "Duration": "00:00:51.3856057", "WarningsActualLength": 0, "ErrorsActualLength": 0, "BackendStatistics": { "BytesUploaded": 8290314, "BytesDownloaded": 53550393, "KnownFileSize": 9920312634, "LastBackupDate": "2025-04-22T00:45:46+01:00", "BackupListCount": 6, "ReportedQuotaError": false, "ReportedQuotaWarning": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "BeginTime": "2025-04-21T23:45:46.9712252Z", "Duration": "00:00:00", "WarningsActualLength": 0, "ErrorsActualLength": 0 } }, "Extra": { "OperationName": "Backup", "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", "machine-name": "WSJ-SER5", "backup-name": "WSJ-SER5 Local files", "backup-id": "DB-2" } } "
```

isse ek App Blueprint generate hua, jise maine baad mein thoda modify kiya (jaise neeche diya gaya hai) `Prototype this App` par click karne se pehle:

![appblueprint](/img/app-blueprint.png)

Maine baad mein design aur vyavhaar ko adjust aur refine karne ke liye yeh prompts upyog kiye:

> dashboard overview page se "view details" button aur machine ke naam par link hata dein, agar user row par kahin bhi click karta hai, to detail page dikhega.

> jab bytes mein aakar dikhayein, to automatic scale (KB, MB, GB, TB) ka upyog karein.

> detail page mein, chart ko table ke baad le jayein. Barchart ke rang ko light aur dark themes ke anukool kisi anya rang mein badlein.

> detail page mein, prati page 5 backups dikhane ke liye rows ki sankhya kam karein.

> dashboard overview mein, upar ek summary dein jismein database mein machines ki sankhya, sabhi machines ke kul backups ki sankhya, sabhi backups ka kul upload kiya gaya aakar aur sabhi machines dwara upyog kiya gaya kul storage shamil ho. Visualization ko aasan banane ke liye icons shamil karein.

> kripya user dwara select ki gayi theme ko persist karein. saath hi, kuch lateral margins jodein aur UI ko available width ka 90% upyog karne dein.

> machine ke vivaran header card mein, is machine ke liye store kiye gaye backups ke kul ka saaransh, backup sthiti ka ek aankada, antim backup ki chetavaniyon aur trutiyon ki sankhya, ausat avadhi hh:mm:ss mein, sabhi backups ka kul upload kiya gaya aakar, aur antim backup jaankaaree praapt ke aadhar par upyog kiya gaya sanrakhshan aakar shaamil karen.

> footprint ko kam karne ke liye saaransh ko chhota aur adhik compact banayein.

> jab antim backup tithi prastut karein, to usi cell mein, ek chhote grrey font mein, backup kab hua tha (udaharan ke liye, x minute pehle, x ghante pehle, x din pehle, x hafte pehle, x mahine pehle, x saal pehle) dikhayein.

> dashboard overview mein antim backup stithi se pehle antim backup tithi dikhayein.

In prompts par iterate karne ke baad, Firebase ne neeche diye gaye screenshots mein dikhaye anusar prototype generate kiya:

![prototype](/img/screen-prototype.png)

![prototype-detail](/img/screen-prototype-detail.png)

:::note
Ek dilchasp baat yeh thi ki, pehle interaction se hi, Firebase Studio ne pages/charts ko populate karne ke liye random data generate kiya, jisse prototype live application ki tarah kaam karne laga.
:::

Prarambhik prototype ko poora karne ke baad, maine interface mein `</>` button par click karke source code access kiya. Maine phir code export karne aur use GitHub par ek private repository mein push karne ke liye Git extension ka upyog kiya (https://www.github.com).

# Backend {#backend}

## Setup {#setup}

Maine GitHub se code ko ek local folder mein download kiya (mere mamle mein, Linux chalane wala Raspberry Pi 5) (`git clone` command ka upyog karke) aur Node.js, npm, aur pnpm dependencies install ki. [DEVELOPMENT.md](../development/setup.md) mein adhik vivaran dekhein.

Maine apne Windows machine se SSH connection ka upyog karke code folder ko access karne ke liye Cursor set up kiya.

Maine Duplicati dwara bheje gaye JSON ka ek sample ek file mein copy kiya (dekhein [sample backup report](../api-reference/database-values) document), kuch anavashyak fields ko saaf kiya.

## Implementation {#implementation}

Maine persistence, fixes, aur nai features par dhyan kendrit karte hue implementation shuru karne ke liye ek prarambhik prompt ka upyog kiya. Yeh ek lamba lekin bahut dilchasp prakriya thi.

### Prompt generate karne ke liye AI ka upyog {#using-ai-to-generate-the-prompt}

Maine Cursor Chat (`Manual` mode, `Auto` model) ka upyog karke ek vistrit prompt banaya:

> is text ko cursor ai tool ke liye ek prompt ke roop mein behtar banayein jo ek application prototype ka implementation generate kare:
> 
> kripya is codebase se ek Next.js application prototype ka poora implementation generate karne ke liye ek plan banayein. Aapke implementation ko exact visual aesthetics, user experience, aur navigation flow ko maintain karne ke liye diye gaye codebase ka poori tarah se vishleshan karna chahiye. Data storage ke liye, SQLite3 ka upyog karein. Database generate karein aur use [sample backup report](../api-reference/database-values) document mein paaye gaye structure aur content ka upyog karke populate karein, yeh sunishchit karein ki JSON ke har field ko poori tarah se integrate aur persist kiya gaya hai.

AI ne nimnalikhit prompt generate kiya:

>Next.js application prototype ke liye ek vishal implementation plan banayein jismein nimnalikhit avashyaktaayein hon:
>
>1. Technical Stack:
>   - Next.js 14+ App Router ke saath
>   - Type safety ke liye TypeScript
>   - Data persistence ke liye SQLite3
>   - Styling ke liye TailwindCSS
>   - Jahaan uchit ho, React Server Components
>   - Interactive elements ke liye Client components
>
>2. Database Design:
>   - Ek optimal SQLite schema banane ke liye sample backup report document ka vishleshan karein
>   - Sabhi backup data ko efficiently store karne ke liye tables design karein
>   - Aam queries ke liye indexes shamil karein
>   - Data validation aur type safety implement karein
>
>3. Application Structure:
>   - Diye gaye codebase se exact UI/UX implement karein
>   - Aam elements ke liye reusable components banayein
>   - App Router ka upyog karke proper routing set karein
>   - Responsive layouts implement karein
>   - Dark/light theme support jodein
>
>4. Core Features:
>   - Machine status table ke saath Dashboard overview
>   - Backup history ke saath detailed machine view
>   - Charts ka upyog karke data visualisation
>   - Real-time backup status updates
>   - Proper error handling aur loading states
>
>5. Data Management:
>   - Data operations ke liye API routes banayein
>   - Efficient data fetching strategies implement karein
>   - Proper data validation jodein
>   - Database operations ke liye error handling shamil karein
>
>Kripya ek vishad implementation plan pradan karein jo in sabhi pahaluon ko cover kare aur saath hi vidyaman visual design aur user experience ko banaye rakhe.

Maine generated prompt ko clipboard par copy kar liya hai.

### Implementeshan yatra shuru karein {#start-the-implementation-journey}

Maine `+` button par click karke ek naya chat banaya, `Agent` mode mein switch kiya, aur Ctrl+Shift+V (text ke roop mein) ka upyog karke prompt paste kiya.

Plan generate hone ke baad, implementation shuru karne ke liye maine chat mein `please, implement this plan` type kiya.

:::note
Maine kewal shuruaati bindu shamil kiya hai kyunki maine istemaal kiye gaye sabhi prompts record nahi kiye. Bahut saare the.
:::

# Notes {#notes}

- Kuch models bugs fix karte samay atak sakte hain. "claude-3.5" aur "claude-4" aam taur par behtar hote hain, lekin kabhi-kabhi aapko dusra model (GPT, Gemini, aadi) try karna padta hai.
Jatil bugs ya errors ke liye, kewal fix karne ke liye kehne ke bajaye error ke sambhavit karanon ka vishleshan karne ke liye ek prompt ka upyog karein.
- Jatil badlav karte samay, ek plan banane ke liye prompt ka upyog karein aur phir AI agent ko ise implement karne ke liye kahein. Yeh hamesha behtar kaam karta hai.
- Source code badalte samay vishesh banein. Yadi sambhav ho, editor mein code ka sambandhit hissa select karein aur ise context ke roop mein chat mein shamil karne ke liye Ctrl+L dabayein.
- Chat mein aap jis file ka ullekh kar rahe hain, uska sandarbh bhi shamil karein taaki AI agent sambandhit hisse par dhyan kendrit kar sake aur anya hisson mein badlav karne se bach sake.
- Meri AI agent ko manviya roop dene ki pravritti hai, kyunki yeh lagatar 'hum', 'hamara code' aur 'kya main chahta hoon ki aap...' ka upyog karta hai. Yeh Skynet ke sentient hone aur Terminator ke avishkar hone ki sthiti mein (ya [jab](https://ai-2027.com/)) meri jeene ki sambhavnaon ko behtar banane ke liye bhi hai.
- Kabhi-kabhi, AI agent ke liye behtar instructions generate karne ke liye [Gemini](https://gemini.google.com/app), [Deepseek](https://chat.deepseek.com/), [ChatGPT](https://chat.openai.com/), [Manus](https://manus.im/app),... ka upyog karein.
