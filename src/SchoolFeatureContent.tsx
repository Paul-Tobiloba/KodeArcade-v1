import { ArrowRight, BookOpen, Building2 } from 'lucide-react';

const signup = '/#/signup?role=school';
const signin = '/#/adult-login?role=school';

export default function SchoolFeatureContent() {
  return <main id="main">
    <section className="marketing-page-heading school-feature-heading" aria-labelledby="school-feature-title">
      <a className="text-link" href="/">Home<ArrowRight size={16} /></a>
      <h1 id="school-feature-title">Big ideas.<br /><span>A whole school.</span></h1>
      <p>Bring coding adventures to your school. Give teachers their own class access, help pupils sign in, and follow learning across Grades 1–6.</p>
      <div className="school-feature-actions"><a className="landing-button" href={signup}>Sign up your school<ArrowRight size={20} /></a><a className="text-link" href={signin}>Already have an account? Sign in<ArrowRight size={18} /></a></div>
      <p className="school-feature-help">Start with your own adult account. Create the school workspace after verifying your email and signing in.</p>
    </section>
    <section className="school-feature-section landing-width school-feature-roles" aria-labelledby="school-roles-title">
      <div><Building2 size={32} aria-hidden="true" /><h2 id="school-roles-title">One school.<br />The right access.</h2><p>Your school’s classes stay with the school, even when its teaching team changes. A teacher’s independent classes remain separate.</p></div>
      <dl>
        <div><dt>School administrators</dt><dd>Create school classes, invite staff, assign teachers and view school class reports.</dd></div>
        <div><dt>Teachers</dt><dd>Manage pupils, login cards and learning in the school classes assigned to them. They can also keep a personal teaching workspace.</dd></div>
        <div><dt>Pupils</dt><dd>Use their classroom code and individual login card to open assigned courses. No child email address is needed.</dd></div>
      </dl>
    </section>
    <section className="school-feature-section landing-width" aria-labelledby="school-tools-title">
      <h2 id="school-tools-title">From the first login<br />to the next discovery.</h2>
      <dl className="school-feature-tools">
        <div><dt>Classes and courses</dt><dd>Create classes, add pupils individually or with a reviewed CSV import, and assign the grade courses you want them to study.</dd></div>
        <div><dt>Login cards for little learners</dt><dd>Choose picture or text passwords for each pupil. Generate private credentials and print PDF cards with their classroom code and sign-in instructions.</dd></div>
        <div><dt>Progress that follows the pupil</dt><dd>Signed-in pupils save code, completed challenges, best stars, quiz work and their current place. Continue learning takes them back to their saved activity.</dd></div>
        <div><dt>Reports for useful conversations</dt><dd>See completion, stars, quiz results and challenge attempts. Use these signals to decide where a pupil might benefit from a check-in, not as a diagnosis.</dd></div>
        <div><dt>A changing teaching team</dt><dd>Invite staff with private, email-bound links and choose administrator or teacher access. Removing a staff member keeps pupil work and school classes intact.</dd></div>
        <div><dt>Keep finished classes safe</dt><dd>Archive a class to pause pupil access and editing while keeping its progress and reports. Restore it when the class is needed again.</dd></div>
      </dl>
    </section>
    <section className="school-feature-section landing-width school-feature-setup" aria-labelledby="school-start-title">
      <div><h2 id="school-start-title">Your school starts here.</h2><p>No shared staff account. Each adult uses their own sign-in, with access granted inside the school workspace.</p><a className="landing-button" href={signup}>Sign up your school<ArrowRight size={20} /></a></div>
      <ol>
        <li><h3>Create your adult account</h3><p>Use your own name and email. Verify the email, then sign in. Already registered? Use the sign-in link above.</p></li>
        <li><h3>Create the school workspace</h3><p>Enter the school name and confirm you’re authorized to administer it. You become its first administrator. Existing personal classes are not moved.</p></li>
        <li><h3>Bring your team and pupils in</h3><p>Share private staff invitations, create school classes, assign teachers and courses, then print pupils’ login cards.</p></li>
      </ol>
    </section>
    <section className="landing-faq school-feature-faq" aria-labelledby="school-faq-title"><h2 id="school-faq-title">Before your school begins</h2>
      <details><summary>I’m a teacher invited by my school. Do I create a school?</summary><p>No. Open the private invitation from your administrator and sign in with the email address they invited. You’ll see the school and role before accepting. Don’t create a second school workspace.</p></details>
      <details><summary>Can I use my existing teacher account?</summary><p>Yes. <a className="text-link" href={signin}>Sign in to set up your school</a>. One adult account can have a personal workspace and school memberships. Their classes and access stay separate.</p></details>
      <details><summary>How do pupils sign in?</summary><p>They enter the classroom code, then use their own username and picture or text password from their login card. Grades 1–2 default to picture passwords; teachers can choose the method for each pupil.</p></details>
      <details><summary>Are staff invitation emails sent automatically?</summary><p>Not yet. The administrator generates a private invitation link and shares it with the invited staff member. Links expire after seven days and can be accepted once by the invited verified email.</p></details>
      <details><summary>What should we know about this preview?</summary><p>School management is available in the development preview. Creating a workspace does not verify institutional ownership. Production rollout, school policy review and retention arrangements still need to be completed before a real-pupil pilot. Development verification emails currently deliver only to the configured test inbox.</p></details>
    </section>
    <section className="school-feature-section landing-width school-feature-close"><div><h2>Make room for your<br />next coding adventure.</h2><p>Set up the school, bring your teachers together, and give every pupil a place to start.</p></div><div><a className="landing-button" href={signup}>Sign up your school<ArrowRight size={20} /></a><a className="text-link" href="/#/learn"><BookOpen size={18} />Try an activity first</a></div></section>
  </main>;
}
