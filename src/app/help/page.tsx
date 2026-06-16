import {
  BookOpenText,
  Boxes,
  Download,
  FileJson,
  GitBranch,
  HardDrive,
  HelpCircle,
  KeyRound,
  Library,
  Pencil,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { AiStoryPromptPanel } from "@/components/ai-story-prompt-panel";

export const metadata = { title: "Need Help" };

const nav = [
  ["getting-started", "Getting Started"],
  ["creating-stories", "Creating Stories"],
  ["editing-stories", "Editing Stories"],
  ["reader", "Reader"],
  ["library", "Library"],
  ["sharing", "Sharing Stories"],
  ["importing", "Importing Stories"],
  ["exporting", "Exporting Stories"],
  ["password", "Password Protection System"],
  ["branching", "Story Branching"],
  ["advanced", "Advanced Story Building"],
  ["ai-story-generator", "Let AI Build Your Story"],
  ["faq", "FAQ"],
];

const tutorials = [
  {
    id: "getting-started",
    icon: Sparkles,
    title: "Getting Started",
    objective: "By the end of this tutorial, you will understand the main screens, know how to move around the app, and create your first simple story.",
    why: "This gives new users a safe first path through the app without needing internet access, AI help, or outside videos.",
    prerequisites: ["Open the Story Engine in a browser.", "Use the same browser/device if you want local stories to remain available.", "No account or cloud setup is required."],
    steps: [
      "Open the Home page and read the privacy promise so you understand that stories stay on your device.",
      "Use the top navigation to visit Reader, Library, Help, and Credits.",
      "Choose Create story from the Home page or Library.",
      "Wait for the editor to open with one starter scene.",
      "Change the story title from Untitled adventure to a title such as The Hidden Door.",
      "Press Save and confirm the saved state changes back to Saved locally.",
      "Open Reader to see where finished and imported stories are read.",
      "If you do not want to write JSON manually, open Let AI Build Your Story and copy the prompt into your preferred AI assistant.",
    ],
    visuals: ["[Screenshot: Home page with Create story and Read story]", "[Diagram: Home -> Library -> Editor -> Reader workflow]"],
    examples: ["A teacher creates a classroom choose-your-own-adventure lesson.", "A student creates a two-ending mystery story for a writing assignment."],
    troubleshooting: [
      ["I cannot find my story.", "You may be using a different browser or device.", "Return to the same browser profile where the story was created."],
      ["The app looks installed but stories are gone.", "Browser data may have been cleared.", "Import a saved .story.json backup if you exported one."],
    ],
    next: ["Creating Stories", "Reader", "Library", "Let AI Build Your Story"],
  },
  {
    id: "creating-stories",
    icon: FileJson,
    title: "Creating Stories",
    objective: "By the end of this tutorial, you will create a story with metadata, chapters, pages/scenes, and a clear structure.",
    why: "Good setup keeps large stories understandable and makes sharing easier later.",
    prerequisites: ["You should know how to open Library.", "You need permission to edit the story.", "Optional: prepare a title, author name, description, and chapter plan."],
    steps: [
      "Open Library.",
      "Click Create story.",
      "In the editor header, replace the story title.",
      "Use the Scene inspector to edit the selected scene title and story text.",
      "Add a chapter name if this scene belongs to a chapter such as Prologue or Chapter 1.",
      "Add comma-separated tags such as intro, clue, battle, ending, or classroom.",
      "Use the Story variables field only if you need score, keys, friendship, or other tracked values.",
      "Press Scene to add more pages/scenes.",
      "Use Auto-layout when the map becomes hard to read.",
      "Press Save before leaving the editor.",
    ],
    visuals: ["[Screenshot: Scene inspector fields]", "[Diagram: Chapter containing several connected scenes]"],
    examples: ["Adventure: Start in a forest, choose cave or river, end with treasure or rescue.", "Mystery: Interview suspects, collect clues, accuse the correct person."],
    troubleshooting: [
      ["My scene is not connected.", "New scenes begin as separate nodes.", "Create a choice or continue transition pointing to the new scene."],
      ["My story title changed but Library still shows old data.", "Autosave may still be running.", "Press Save manually and wait for Saved locally."],
    ],
    next: ["Editing Stories", "Story Branching"],
  },
  {
    id: "editing-stories",
    icon: Pencil,
    title: "Editing Stories",
    objective: "By the end of this tutorial, you will edit text, reorder the visual map, save changes, and recover earlier versions.",
    why: "Editing is where stories become clear, polished, and safe to share.",
    prerequisites: ["The story must be yours or shared with Read and Modify permission.", "Read Only shared stories cannot be edited.", "Use a larger screen for heavy editing when possible."],
    steps: [
      "Open Library.",
      "Find the story you want to work on.",
      "Click Edit.",
      "Click any node on the canvas to select a scene.",
      "Edit the title, body, chapter, tags, bonus text, media URLs, or transition type in the inspector.",
      "Drag nodes around the canvas to organize the map.",
      "Use Undo and Redo for recent editing mistakes.",
      "Use Local backups to restore an earlier saved copy if needed.",
      "Use the Analytics tab to review story size and verifier warnings.",
      "Press Save before exporting or closing the app.",
    ],
    visuals: ["[Screenshot: Editor canvas]", "[Screenshot: Local backups panel]"],
    examples: ["Reorder a messy five-scene story into left-to-right reading flow.", "Restore a backup after accidentally removing a branch."],
    troubleshooting: [
      ["I cannot edit this story.", "The story was shared as Read Only.", "Ask the owner to share it using Read and Modify permissions."],
      ["My choice points to the wrong scene.", "The choice target was selected incorrectly.", "Open the choice card and pick the correct target scene."],
    ],
    next: ["Sharing Stories", "Advanced Story Building"],
  },
  {
    id: "reader",
    icon: BookOpenText,
    title: "Reader",
    objective: "By the end of this tutorial, you will use Reader as the central place for reading all available stories.",
    why: "Reader separates enjoying a story from editing it, which is especially important for classrooms and shared files.",
    prerequisites: ["At least one local story, imported story, or the bundled demo.", "Optional: a .story.json file to import.", "Remote images require explicit consent before loading."],
    steps: [
      "Open Reader from the top navigation.",
      "Look under Your Stories for stories created in this browser.",
      "Look under Shared Stories for stories imported from other people.",
      "Click Read on any story card.",
      "Use choice buttons to move through the story.",
      "Use Restart to return to the start scene.",
      "If a scene has remote images, choose Load remote images only if you trust that image host.",
      "If bonus text appears, click Reveal bonus text to read optional extra content.",
    ],
    visuals: ["[Screenshot: Reader shelf with Your Stories and Shared Stories]", "[Screenshot: Reader choice buttons]"],
    examples: ["Read a Read Only class assignment without changing it.", "Playtest your own story before exporting it."],
    troubleshooting: [
      ["No stories appear in Reader.", "No stories have been created or imported yet.", "Create a story in Library or import a .story.json file."],
      ["A choice is missing.", "The choice has a condition that is not currently true.", "Restart or choose a path that sets the required variable."],
    ],
    next: ["Importing Stories", "Story Branching"],
  },
  {
    id: "library",
    icon: Library,
    title: "Library",
    objective: "By the end of this tutorial, you will understand which stories belong in Library and how each action works.",
    why: "Library is your editing workspace, so it should contain only stories you own or can modify.",
    prerequisites: ["Use the same browser where your stories are stored.", "For shared editable stories, import the file with the correct password."],
    steps: [
      "Open Library from the top navigation.",
      "Review the listed stories. Library shows your stories and editable shared stories only.",
      "Use Read to preview the story in Reader.",
      "Use Edit to open the visual editor.",
      "Use Duplicate to create a separate editable copy.",
      "Use Password Protection to export the passcode needed for Read and Modify sharing.",
      "Use Share to open the permissions popup.",
    ],
    visuals: ["[Screenshot: Library story card actions]", "[Diagram: Library excludes Read Only shared stories]"],
    examples: ["Duplicate a classroom template before students modify it.", "Export a password before sending an editable file to a co-writer."],
    troubleshooting: [
      ["A Read Only story is not in Library.", "That is intentional.", "Open it from Reader under Shared Stories."],
      ["The Password button downloads a file.", "Password Protection data is private edit access information.", "Store it safely and share only with trusted editors."],
    ],
    next: ["Sharing Stories", "Password Protection System"],
  },
  {
    id: "sharing",
    icon: Share2,
    title: "Sharing Stories",
    objective: "By the end of this tutorial, you will share a story as Read Only or Read and Modify.",
    why: "Simple permissions let you choose whether someone can only read your story or collaborate on it.",
    prerequisites: ["The story must be yours or editable.", "The story should pass verification before serious sharing.", "For Read and Modify sharing, prepare a safe way to send the password separately."],
    steps: [
      "Open Library or Editor.",
      "Click Share.",
      "Read the sharing permissions popup.",
      "Choose Option 1: Read Only if the recipient should only read and navigate the story.",
      "Choose Option 2: Read and Modify if the recipient should edit, continue writing, and save changes.",
      "Send the downloaded .story.json file to the recipient.",
      "For Read and Modify, send the password separately using a trusted channel.",
      "Tell the recipient to import the file. Editable imports will ask for the password before opening the editor.",
    ],
    visuals: ["[Screenshot: Sharing Permissions Popup]", "[Diagram: File plus separate password]"],
    examples: ["Read Only: publish a finished mystery for classmates.", "Read and Modify: send a draft to a writing partner who will add chapter two."],
    troubleshooting: [
      ["The recipient cannot edit.", "The file was shared as Read Only or the password is wrong.", "Share again using Read and Modify and provide the correct password."],
      ["The recipient can read but not reshare edit access.", "Read Only exports do not include edit permission.", "Only the owner/editor should create Read and Modify exports."],
    ],
    next: ["Password Protection System", "Exporting Stories"],
  },
  {
    id: "importing",
    icon: Upload,
    title: "Importing Stories",
    objective: "By the end of this tutorial, you will import supported story files and understand common import problems.",
    why: "Importing lets stories move between devices without cloud accounts.",
    prerequisites: ["A .story.json or compatible JSON file.", "For editable shared files, the password.", "Enough browser storage for the story and local media."],
    steps: [
      "Open Reader if you only want to read, or Library if you may need editing access.",
      "Click Import story.",
      "Choose the .story.json file from your device.",
      "If the file is Read Only, it will be saved and opened in Reader.",
      "If the file is Read and Modify, enter the password when prompted.",
      "After importing, check Reader under Shared Stories.",
      "For editable imports, also check Library.",
    ],
    visuals: ["[Screenshot: Import story button]", "[Screenshot: Password prompt for editable import]"],
    examples: ["Import a teacher's Read Only story assignment.", "Import a collaborator's editable draft and continue writing."],
    troubleshooting: [
      ["That file is not a valid Big MAQ story.", "The JSON is malformed, unsupported, or missing required fields.", "Ask the sender to export again from the app."],
      ["Wrong passcode.", "The entered password does not match the encrypted verifier in the JSON.", "Check spelling, spaces, and the correct story password."],
    ],
    next: ["Reader", "Library"],
  },
  {
    id: "exporting",
    icon: Download,
    title: "Exporting Stories",
    objective: "By the end of this tutorial, you will export JSON, standalone HTML, and story-map files.",
    why: "Exports are your backups, submission files, and sharing packages.",
    prerequisites: ["Open an editable story.", "Fix blocking verifier errors before JSON export.", "Use trusted storage for backups and passwords."],
    steps: [
      "Open the story in Editor.",
      "Use Analytics and Verifier to check for broken links or missing endings.",
      "Click JSON to export a portable .story.json file.",
      "Click HTML to export a standalone reader file.",
      "Click Map to export a printable SVG story map.",
      "Use Share when you need Read Only or Read and Modify permissions.",
      "Keep exported backups somewhere safe outside the browser.",
    ],
    visuals: ["[Screenshot: Editor export buttons]", "[Diagram: JSON vs HTML vs Map export]"],
    examples: ["Submit an HTML version to a teacher for reading.", "Print an SVG map to explain branching structure.", "Keep a JSON backup before making major edits."],
    troubleshooting: [
      ["JSON export is disabled.", "The verifier found a blocking story issue.", "Open Analytics and fix invalid targets, missing starts, or paths without endings."],
      ["Remote images do not appear offline.", "Remote URLs require internet and user consent.", "Use local attachments for fully offline media."],
    ],
    next: ["Sharing Stories", "Story Branching"],
  },
  {
    id: "password",
    icon: KeyRound,
    title: "Password Protection System",
    objective: "By the end of this tutorial, you will understand what Password Protection does and how it protects editable sharing inside the app.",
    why: "Password Protection keeps editing permission separate from the story file, making accidental edit access less likely.",
    prerequisites: ["An editable story in Library.", "A trusted way to send the password to collaborators.", "Understand that JSON is readable text, not a locked binary file."],
    steps: [
      "Open Library.",
      "Choose Password Protection on a story card to export the private password file.",
      "Choose Share and then Read and Modify to export an editable story file.",
      "Send the story file to the collaborator.",
      "Send the password separately.",
      "The collaborator imports the story and enters the password.",
      "The app verifies the entered password against the encrypted verifier stored in the JSON.",
    ],
    visuals: ["[Diagram: Password Protection -> encrypted verifier check]", "[Screenshot: Password button]"],
    examples: ["A teacher sends editable feedback access only to a student.", "Two writers exchange a Read and Modify file and password to co-write a chapter."],
    troubleshooting: [
      ["The password file should not be public.", "Anyone with the editable file and password can unlock editing in the app.", "Share passwords only with trusted people."],
      ["Manual JSON edits can bypass app UI rules.", "JSON is a portable text format.", "For legal/security-grade protection, use encrypted packages in a future release."],
    ],
    next: ["Sharing Stories", "Importing Stories"],
  },
  {
    id: "branching",
    icon: GitBranch,
    title: "Story Branching",
    objective: "By the end of this tutorial, you will build choices, paths, merged routes, and multiple endings.",
    why: "Branching is the heart of interactive storytelling.",
    prerequisites: ["At least three scenes.", "A clear idea of what decision the reader should make.", "Basic understanding of start scenes and endings."],
    steps: [
      "Select the scene where the reader should make a decision.",
      "Change Transition to Choices.",
      "Click Add choice.",
      "Write a clear button label such as Open the door or Run away.",
      "Choose the target scene for that choice.",
      "Add more choices for alternate paths.",
      "Use Continue for simple one-way movement.",
      "Set final scenes to Ending.",
      "Use Analytics to confirm every reachable path can reach an ending.",
    ],
    visuals: ["[Diagram: Branch with two choices and two endings]", "[Screenshot: Choice editor fields]"],
    examples: ["Adventure: cave path finds treasure, river path rescues a friend.", "Mystery: accuse suspect A, B, or C and reach different endings."],
    troubleshooting: [
      ["A path never ends.", "A scene loops or points away from endings.", "Add an ending scene or connect the path to an existing ending."],
      ["A choice does not show in Reader.", "Its condition is false.", "Check variables and condition spelling."],
    ],
    next: ["Advanced Story Building", "Exporting Stories"],
  },
  {
    id: "ai-assisted",
    icon: Sparkles,
    title: "Using AI to Build Stories",
    objective: "By the end of this tutorial, you will copy the dynamic Story Engine AI prompt, describe a story, request branching, request password protection, and import the generated JSON.",
    why: "Some users know the story they want but do not want to learn JSON, schema rules, variables, or branching architecture before creating.",
    prerequisites: ["Access to any AI assistant such as ChatGPT, Claude, Gemini, DeepSeek, Grok, or a local LLM.", "A story idea, genre, or short premise.", "The ability to save AI output as a .story.json file."],
    steps: [
      "Open Let AI Build Your Story.",
      "Choose Standard Prompt for a simple story or Advanced Prompt for hidden routes, variables, relationships, inventory, long-form worldbuilding, and password-protected stories.",
      "Click Copy Prompt.",
      "Paste it into your preferred AI assistant.",
      "Describe your story idea, such as a fantasy mage, detective mystery, spaceship survival story, or romance visual novel.",
      "Ask for JSON only.",
      "Ask the AI to include branching, multiple endings, variables, and Password Protection if needed.",
      "Save the generated JSON as a .story.json file.",
      "Import it into the Story Engine and fix any validation issues by asking the AI to validate references, endings, and password metadata.",
    ],
    visuals: ["[Screenshot: Let AI Build Your Story panel]", "[Screenshot: Copy Prompt button]", "[Diagram: AI prompt -> JSON -> Import story]"],
    examples: ["Create a detective mystery with multiple suspects and five endings.", "Create a password-protected classroom story where students can read but only the teacher can edit.", "Create a spaceship survival story with inventory variables and hidden routes."],
    troubleshooting: [
      ["AI generated invalid JSON.", "The AI added prose, Markdown, comments, or trailing commas.", "Ask for valid JSON only and paste the dynamic schema prompt again."],
      ["AI generated incomplete branches.", "The AI ended a path early or forgot target scenes.", "Ask the AI to validate all branch connections and every targetSceneId."],
      ["AI forgot endings.", "The prompt was too vague about story closure.", "Ask for every reachable path to terminate in an ending scene."],
      ["Password errors.", "Password metadata is missing or malformed.", "Regenerate using the Story Engine schema prompt and request Password Protection compatibility."],
    ],
    next: ["Importing Stories", "Story Branching", "Password Protection System"],
  },
  {
    id: "advanced",
    icon: Boxes,
    title: "Advanced Story Building",
    objective: "By the end of this tutorial, you will organize larger stories using variables, conditions, bonus text, tags, chapters, media, and verification.",
    why: "Advanced tools help large projects stay understandable and replayable.",
    prerequisites: ["Comfort with scenes and choices.", "A plan for variables such as score, hasKey, trust, or friendship.", "Use short, consistent variable names."],
    steps: [
      "Create story variables as JSON, for example { \"friendship\": 0, \"hasKey\": false }.",
      "Add choice effects such as friendship += 1 or hasKey = true.",
      "Add choice conditions such as friendship >= 2 or hasKey == true.",
      "Add bonus text for optional material.",
      "Use bonus conditions to reveal extra text only after certain choices.",
      "Group related scenes with chapters and tags.",
      "Use Search to find scenes by title, body, tag, or chapter.",
      "Use Playtest to check a path without leaving the editor.",
      "Use Verifier before sharing.",
    ],
    visuals: ["[Screenshot: Variables and conditions]", "[Diagram: Bonus text unlocked by friendship >= 1]"],
    examples: ["In the Pokémon demo, choosing Defend adds friendship += 1. Later, a Misty bonus appears only when friendship >= 1.", "In a mystery, finding the brass key sets hasKey = true and unlocks the attic path."],
    troubleshooting: [
      ["A condition never works.", "Variable names or value types may not match.", "Use simple expressions like score >= 2 or hasKey == true."],
      ["A large story feels messy.", "Too many nodes are ungrouped.", "Use chapters, tags, search, and Auto-layout."],
    ],
    next: ["Story Branching", "Exporting Stories"],
  },
];

const faqs = [
  ["Does the app need an account?", "No. Stories are stored in your browser with IndexedDB. There is no login or cloud story database."],
  ["Where are my stories saved?", "They are saved locally in the current browser profile. Export JSON backups before clearing browser data."],
  ["Why is a Read Only story missing from Library?", "Library is only for stories you can edit. Open Read Only shared stories in Reader under Shared Stories."],
  ["Can I edit a shared story?", "Only if it was shared as Read and Modify and you have the correct password."],
  ["What is a password?", "A password is the passcode that unlocks editable shared files in the app."],
  ["Is Password Protection real encryption?", "The JSON stores a salted PBKDF2 verifier rather than the plain passcode. This protects app editing access, but JSON remains readable text."],
  ["Can I use the app offline?", "Yes after the app shell has loaded once. Remote images still need internet and consent."],
  ["What file format should I share?", "Use .story.json for editable or portable sharing. Use HTML for a standalone reader. Use SVG Map for a printable diagram."],
  ["Why does export block my story?", "The verifier blocks export when the story has serious structure problems such as invalid links or no ending path."],
  ["Can I import stories from other tools?", "Only if they match the Big MAQ story JSON schema. Other tools need conversion first."],
  ["Can I delete stories?", "This interface currently focuses on safe reading, editing, duplication, password, and sharing. Export backups before any future cleanup actions."],
  ["Can I collaborate live?", "Not in this release. Collaboration works by exporting and importing files."],
];

export default function HelpPage() {
  return (
    <main className="shell py-10">
      <section className="rounded-[2rem] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-8 ring-1 ring-indigo-100">
        <p className="eyebrow">Need Help</p>
        <h1 className="mt-2 text-4xl font-black text-indigo-950">Interactive Story Engine documentation</h1>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-700">
          This guide is designed to be complete enough for someone with no internet access, no AI assistance, and no prior knowledge to learn the Story Engine successfully.
        </p>
        <nav className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
          {nav.map(([id, label]) => <a className="rounded-full bg-white px-4 py-2 text-indigo-700 ring-1 ring-indigo-100 hover:bg-indigo-50" href={`#${id}`} key={id}>{label}</a>)}
        </nav>
      </section>

      <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
        <h2 className="flex items-center gap-2 text-lg font-black"><ShieldCheck size={20} /> Privacy and offline promise</h2>
        <p className="mt-2">No account, tracking, analytics, or server-side story storage. Vercel serves the app; your writing stays in your browser unless you export or share it. Remote media URLs are optional and may contact third-party hosts only when loaded.</p>
      </section>

      <section className="mt-10 grid gap-8">
        {tutorials.map((tutorial) => {
          const Icon = tutorial.icon;
          return (
            <article className="card scroll-mt-24 p-6" id={tutorial.id} key={tutorial.id}>
              <div className="flex flex-wrap items-start gap-4">
                <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700"><Icon size={28} /></div>
                <div>
                  <h2 className="text-3xl font-black text-indigo-950">{tutorial.title}</h2>
                  <p className="mt-2 max-w-4xl leading-7 text-slate-600">{tutorial.objective}</p>
                  <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500"><strong>Why this matters:</strong> {tutorial.why}</p>
                </div>
              </div>

              <DocBlock title="Prerequisites" items={tutorial.prerequisites} />
              <DocBlock title="Step-by-step instructions" items={tutorial.steps} ordered />
              <DocBlock title="Visual aid placeholders" items={tutorial.visuals} />
              <DocBlock title="Practical examples" items={tutorial.examples} />

              <section className="mt-5">
                <h3 className="text-lg font-black text-indigo-950">Troubleshooting</h3>
                <div className="mt-3 grid gap-3">
                  {tutorial.troubleshooting.map(([problem, cause, solution]) => (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6" key={problem}>
                      <p><strong>Problem:</strong> {problem}</p>
                      <p><strong>Cause:</strong> {cause}</p>
                      <p><strong>Solution:</strong> {solution}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-5 rounded-2xl bg-indigo-50 p-4 text-sm leading-6 text-indigo-950">
                <h3 className="font-black">Review and next steps</h3>
                <p className="mt-1">You learned the core workflow for {tutorial.title.toLowerCase()}. Recommended next tutorials: {tutorial.next.join(", ")}.</p>
              </section>
            </article>
          );
        })}
      </section>

      <AiStoryPromptPanel />

      <section id="faq" className="card mt-10 scroll-mt-24 p-6">
        <div className="flex items-center gap-3">
          <HelpCircle className="text-indigo-600" size={30} />
          <h2 className="text-3xl font-black text-indigo-950">Frequently Asked Questions</h2>
        </div>
        <div className="mt-5 grid gap-3">
          {faqs.map(([question, answer]) => (
            <details className="rounded-2xl bg-slate-50 p-4" key={question}>
              <summary className="cursor-pointer font-black text-indigo-950">{question}</summary>
              <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <MiniCard icon={Search} title="Best practice" text="Search by scene title, body, chapter, or tag before editing large projects." />
        <MiniCard icon={HardDrive} title="Backup habit" text="Export JSON before major rewrites or before clearing browser data." />
        <MiniCard icon={BookOpenText} title="Reader first" text="Use Reader for all playable stories. Use Library only when you need editing tools." />
      </section>
    </main>
  );
}

function DocBlock({ title, items, ordered = false }: { title: string; items: string[]; ordered?: boolean }) {
  const List = ordered ? "ol" : "ul";
  return (
    <section className="mt-5">
      <h3 className="text-lg font-black text-indigo-950">{title}</h3>
      <List className={`mt-2 space-y-2 text-sm leading-6 text-slate-700 ${ordered ? "list-decimal" : "list-disc"} pl-5`}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </List>
    </section>
  );
}

function MiniCard({ icon: Icon, title, text }: { icon: typeof Search; title: string; text: string }) {
  return (
    <article className="card p-5">
      <Icon className="text-indigo-600" />
      <h2 className="mt-3 text-lg font-black text-indigo-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}
