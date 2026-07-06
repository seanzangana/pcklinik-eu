// News posts (rendered statically). Newest first.
export const news = [
  {
    slug: 'how-to-tell-if-your-laptop-battery-needs-replacing',
    title: "How to tell if your laptop battery needs replacing",
    date: '2026-07-05',
    category: 'Guides',
    description: "Five clear signs your laptop battery is on the way out — and how to check its real health before you spend money.",
    body: `
<p>Laptop batteries wear out. It's normal — they're consumable parts, and after a few hundred charge cycles they simply hold less than they used to. The tricky part is knowing when a fading battery has crossed from "a bit annoying" into "replace it now." Here are the signs worth paying attention to.</p>
<h2>1. It drains fast, even from a full charge</h2>
<p>The most obvious one. If you used to get six or seven hours and now you're scrambling for a charger after ninety minutes, the battery's capacity has dropped. A little decline every year is expected. A sudden or severe drop isn't.</p>
<h2>2. It shuts down at 30% or 40%</h2>
<p>A healthy battery runs down to a low percentage before the laptop sleeps. A tired one can misread its own charge and cut out early — you're at 35% and the screen goes black with no warning. That's a strong sign the cells are failing.</p>
<h2>3. It only works plugged in</h2>
<p>If unplugging the charger instantly kills the machine, the battery is barely holding anything at all. Some people run a laptop like this for months, but it turns a portable computer into a desktop that dies in every power cut.</p>
<h2>4. The battery is swollen</h2>
<p>This one matters for safety, not just convenience. If the trackpad feels raised, the case is bulging, or the laptop rocks on a flat desk, stop using it and bring it in. A swollen battery is a genuine hazard and shouldn't be left in the machine.</p>
<h2>5. Your system reports poor battery health</h2>
<p>On a Mac, hold Option and click the battery icon, or check System Settings, then Battery, then Battery Health. On Windows, open a command prompt and run <code>powercfg /batteryreport</code> to see design capacity versus current capacity. If the current figure is well below the original, the numbers confirm what you're feeling.</p>
<h2>Worth replacing, or worth replacing the laptop?</h2>
<p>On most machines a battery swap is quick and far cheaper than a new computer, so it's usually worth it if the rest of the laptop is fine. On a very old machine with other problems, it may not be. We'll always give you an honest answer as part of the fixed quote rather than pushing a replacement you don't need.</p>
<p>If you've spotted any of these signs, we handle battery replacement for laptops and MacBooks — see our <a href="/mac-battery-replacement/">Mac Battery Replacement</a> page, or just <a href="/contact/">contact us</a> and we'll check the battery's real health for you.</p>
`,
  },
  {
    slug: 'common-mac-startup-screens-and-what-they-mean',
    title: "Common Mac startup screens and what they mean",
    date: '2026-07-03',
    category: 'Guides',
    description: "A folder with a question mark, a circle with a line, a lock — here's what the icons on a Mac startup screen are actually telling you.",
    body: `
<p>When a Mac won't boot normally, it often shows a symbol instead of the desktop. Each one points at a different problem, and knowing which is which saves a lot of guesswork. Here are the ones we see most often.</p>
<h2>A folder with a flashing question mark</h2>
<p>The Mac can't find a system to start up from. Usually that means the startup disk isn't being detected, or macOS is missing or damaged. Sometimes it's a loose drive connection; sometimes the drive itself is failing. If your files aren't backed up, this is the point to stop and get it checked rather than experimenting.</p>
<h2>A circle with a line through it (prohibitory sign)</h2>
<p>The Mac found a system, but it can't use it — often because the macOS version isn't compatible with that machine, or the install is corrupted. A reinstall usually fixes it, but the cause is worth confirming first.</p>
<h2>A lock screen asking for a firmware or PIN password</h2>
<p>This is a security feature, not a fault. The Mac is locked at the hardware level and needs the correct password. If it's your machine and you've forgotten it, recovery can be involved — and if you bought the Mac secondhand while it was still locked, that's a conversation to have with the seller.</p>
<h2>A progress bar that never finishes</h2>
<p>The Mac is trying to load but getting stuck partway — commonly a software or update issue, sometimes a drive that's struggling to read. If it sits at the same point for a long time on every attempt, it's not going to fix itself.</p>
<h2>A globe, or a spinning globe</h2>
<p>The Mac is trying to start up over the internet (Internet Recovery) because it couldn't start from the built-in drive. That again points at a missing or damaged system on the disk.</p>
<h2>What to do</h2>
<p>A few of these have safe do-it-yourself steps, but several — especially the question-mark folder and a stuck progress bar — can involve a failing drive, where every extra restart is a small risk to your data. If you're seeing any of these, our <a href="/error-messages/">Error Messages</a> guide covers more codes, and our <a href="/mac-repair/">Mac Repair</a> team can diagnose exactly what the symbol means for your machine. When in doubt, <a href="/contact/">contact us</a> before the data becomes harder to recover.</p>
`,
  },
  {
    slug: 'the-3-2-1-backup-rule-and-why-it-matters',
    title: "The 3-2-1 backup rule, and why it matters",
    date: '2026-07-01',
    category: 'Guides',
    description: "A simple, memorable rule for backing up your data properly — so one failure, theft, or mistake never wipes out everything.",
    body: `
<p>Most people who lose data didn't ignore backups on purpose. They had one copy on the laptop and, sometimes, a second on a drive sitting right next to it. Then the laptop failed, or was stolen, or a ransomware infection encrypted both at once. The 3-2-1 rule exists to make that scenario nearly impossible, and it's easy to remember.</p>
<h2>Three copies of your data</h2>
<p>Keep your working files plus two backups. The point is redundancy: if one copy dies, you've still got two. One backup is better than none, but a single backup that fails at the wrong moment leaves you with nothing.</p>
<h2>On two different types of media</h2>
<p>Don't keep both backups on the same kind of thing. An external hard drive and a cloud account, for example — not two USB sticks from the same batch. Different media fail in different ways, so spreading across two types means a single fault can't take out both at once.</p>
<h2>One copy kept off-site</h2>
<p>This is the part people skip, and it's the most important. If all your copies are in one place, a fire, flood, burglary, or a spilled coffee across the desk can take everything. An off-site copy — cloud backup, or a drive kept somewhere else — survives anything that happens to your home or office.</p>
<h2>What this looks like in practice</h2>
<p>A common, low-effort setup: your files live on the laptop (copy one), an external drive at home backs up automatically (copy two, different medium), and a cloud backup service holds a third copy off-site. Set the automatic ones up once and they run quietly in the background. That's the whole point — a backup you have to remember to do is a backup you'll eventually forget.</p>
<h2>The one thing worth checking</h2>
<p>A backup you've never tested isn't really a backup yet. Every so often, open a file from the backup to confirm it actually restores. It takes a minute and it's the difference between "I have a backup" and "I had what I thought was a backup."</p>
<p>If you'd rather have this set up properly and automatically — so it just runs without you thinking about it — that's exactly what our <a href="/data-backup-and-recovery/">Data Backup &amp; Recovery</a> service does. And if you've already lost something, <a href="/contact/">contact us</a> quickly; the sooner we look, the better the odds of getting it back.</p>
`,
  },
];
