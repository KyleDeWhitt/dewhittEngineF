// DeWhitt Fit privacy policy and terms of use.
// Keep in sync with dewhittFitEngine/app/src/components/Legal.jsx (links there have no /fit prefix).
// When the app starts collecting something new or uses a new outside service, update this page.
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { T, FONT, Paper, MarkerTitle, Tape } from '../theme';

const CONTACT = 'support@dewhittdesigns.com';
const EFFECTIVE = 'November 24, 2026';
const HOME = '/fit';

const H = ({ children }) => <MarkerTitle style={{ fontSize: '1.2rem', margin: '26px 0 6px' }}>{children}</MarkerTitle>;
const P = ({ children }) => <p style={{ margin: '8px 0', lineHeight: 1.55 }}>{children}</p>;
const UL = ({ children }) => <ul style={{ margin: '8px 0', paddingLeft: 22, lineHeight: 1.55 }}>{children}</ul>;
const Mail = () => <a href={`mailto:${CONTACT}`} style={{ color: T.blue }}>{CONTACT}</a>;

function LegalPage({ title, docTitle, children }) {
    useEffect(() => {
        const prev = document.title;
        document.title = docTitle;
        return () => { document.title = prev; };
    }, [docTitle]);
    return (
        <div style={{ minHeight: '100vh', background: 'radial-gradient(1200px 700px at 50% -10%, #332a20, #211b15)', padding: '28px 16px 60px', boxSizing: 'border-box', fontFamily: FONT }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
                <Link to={HOME || '/'} style={{ color: '#f3ead6', fontFamily: FONT, textDecoration: 'none' }}>&larr; DeWhitt Fit</Link>
                <Paper margin style={{ padding: '26px 26px 30px 62px', marginTop: 14, color: T.inkSoft, fontSize: '1.02rem' }}>
                    <Tape rotate={-2}>EFFECTIVE {EFFECTIVE.toUpperCase()}</Tape>
                    <MarkerTitle style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', marginTop: 14 }}>{title}</MarkerTitle>
                    {children}
                    <div style={{ marginTop: 30, paddingTop: 14, borderTop: `1px dashed ${T.ruled}`, fontSize: '0.9rem', color: T.pencil }}>
                        Questions? Email <Mail />. · <Link to={`${HOME}/privacy`} style={{ color: T.blue }}>Privacy</Link> · <Link to={`${HOME}/terms`} style={{ color: T.blue }}>Terms</Link>
                    </div>
                </Paper>
            </div>
        </div>
    );
}

export function FitPrivacy() {
    return (
        <LegalPage title="Privacy Policy" docTitle="Privacy Policy · DeWhitt Fit">
            <P>DeWhitt Fit is run by DeWhitt Designs (&ldquo;we&rdquo;). This policy explains what we collect when you use the DeWhitt Fit website and Android app, why, and the choices you have. The short version: we use your data to run your journal and your coaching, we don&rsquo;t sell it, and we don&rsquo;t show ads.</P>

            <H>What we collect</H>
            <UL>
                <li><strong>Account:</strong> your first and last name, email address, and password (stored only as a secure hash).</li>
                <li><strong>Profile:</strong> height, weight, goal weight, age, gender, activity level, goal and preferred units. We use these to estimate your daily calorie target.</li>
                <li><strong>Journal:</strong> the workouts, food and macros, water, sleep and notes you log.</li>
                <li><strong>Form checks:</strong> when you choose to send one, the body-position data your device extracted from the video (points such as shoulders, hips and knees over time), the angles and reps calculated from it, two small still images from the video with the face pixelated, and any note you add. Your coach&rsquo;s notes on the clip are stored too.</li>
                <li><strong>On your device:</strong> the app keeps your sign-in token and whether you agreed to share form checks in your browser&rsquo;s or phone&rsquo;s local storage.</li>
            </UL>

            <H>Your video stays on your device</H>
            <P>Form-check videos are analyzed on your own phone or computer. The video itself is never uploaded to us. Only the items listed under &ldquo;Form checks&rdquo; above are sent, and only when you tap &ldquo;send to coach&rdquo;.</P>

            <H>How we use it</H>
            <UL>
                <li>To run the app: save your journal, calculate calories, streaks and personal records, and show your history.</li>
                <li>To let your coach review the form checks you send and reply with notes.</li>
                <li>To send account emails, such as verifying your email address.</li>
                <li>To keep the service secure and fix problems.</li>
            </UL>
            <P>We don&rsquo;t sell your data, share it for advertising, or use it to build profiles for anyone else.</P>

            <H>Who can see it</H>
            <UL>
                <li><strong>You.</strong></li>
                <li><strong>Your coach</strong> sees your name and the form checks you send, including the stills and your note.</li>
                <li><strong>Our administrators</strong> may access account data when needed to run the service or help you with a problem.</li>
                <li><strong>Service providers</strong> that run parts of the app for us, only for that purpose:
                    <UL>
                        <li>Render (hosts our server) and Hostinger (hosts the website and database)</li>
                        <li>Resend (sends account emails)</li>
                        <li>Open Food Facts (receives the food search terms you type, not who you are)</li>
                        <li>Google and jsDelivr (your device downloads the body-tracking model files from them; no journal or body data is sent)</li>
                        <li>Stripe, if you ever pay for something: Stripe processes the payment and we never see your full card number</li>
                    </UL>
                </li>
                <li><strong>Legal reasons:</strong> if required by law, or to protect someone&rsquo;s safety.</li>
            </UL>

            <H>Health information</H>
            <P>Body measurements, food logs and movement data can say something about your health, so we treat them as sensitive. We use them only to provide the app and coaching you asked for. DeWhitt Fit is a fitness and coaching tool, not a medical service.</P>

            <H>How long we keep it, and deleting it</H>
            <UL>
                <li>Your data is kept while your account is open.</li>
                <li>You can delete any form check yourself in the app, at any time. Your coach will no longer see it.</li>
                <li>To delete your account and all its data, or to get a copy of your data or correct it, email <Mail /> from your account&rsquo;s email address. We&rsquo;ll confirm and complete the request within 30 days.</li>
            </UL>

            <H>Security</H>
            <P>Data travels over encrypted connections (HTTPS), passwords are stored as hashes, and form checks can only be opened by you and your coach. No system is perfectly secure, but we work to protect your information.</P>

            <H>Age</H>
            <P>DeWhitt Fit is meant for people 18 and older. We don&rsquo;t knowingly collect data from children. If you believe a child has signed up, email us and we&rsquo;ll delete the account.</P>

            <H>Changes</H>
            <P>If we change this policy, we&rsquo;ll update the date at the top and, for significant changes, let you know in the app or by email.</P>
        </LegalPage>
    );
}

export function FitTerms() {
    return (
        <LegalPage title="Terms of Use" docTitle="Terms of Use · DeWhitt Fit">
            <P>These terms apply to the DeWhitt Fit website and Android app, run by DeWhitt Designs (&ldquo;we&rdquo;). By creating an account or using DeWhitt Fit, you agree to them. If you don&rsquo;t agree, please don&rsquo;t use the app.</P>

            <H>Who can use it</H>
            <P>You must be 18 or older. Keep your password private; you&rsquo;re responsible for what happens under your account.</P>

            <H>Not medical advice</H>
            <P>DeWhitt Fit is for general fitness tracking and coaching. It does not diagnose, treat or prevent any medical condition. Calorie targets, calories burned, personal-record estimates, joint angles and form-check observations are estimates and can be wrong. Coach feedback is general coaching, not medical or physical-therapy advice. Talk to a doctor before starting a new exercise or nutrition program, especially if you have an injury or health condition, and stop if something hurts.</P>

            <H>Exercise is your responsibility</H>
            <P>Exercise carries a risk of injury. You choose what you lift and how, and you take part at your own risk. Film form checks only where it&rsquo;s safe to do so, and only film other people with their permission.</P>

            <H>Your content</H>
            <P>You own what you log and send. You give us permission to store, process and display it as needed to run the app, including showing your form checks to your coach. You can delete form checks at any time, and you can ask us to delete your account as described in the <Link to={`${HOME}/privacy`} style={{ color: T.blue }}>Privacy Policy</Link>.</P>

            <H>Fair use</H>
            <UL>
                <li>Don&rsquo;t misuse the service: no hacking, scraping, overloading it, or accessing other people&rsquo;s accounts.</li>
                <li>Don&rsquo;t upload content that&rsquo;s illegal or that you don&rsquo;t have the right to share.</li>
            </UL>
            <P>We may suspend or close accounts that break these terms.</P>

            <H>The service</H>
            <P>We work to keep DeWhitt Fit running and accurate, but it&rsquo;s provided &ldquo;as is&rdquo;. We may change features, and the app may sometimes be unavailable. To the extent the law allows, we aren&rsquo;t liable for indirect or consequential losses, or for injuries resulting from exercise or from relying on estimates in the app.</P>

            <H>Changes</H>
            <P>We may update these terms. We&rsquo;ll change the date at the top and, for significant changes, let you know. Continuing to use DeWhitt Fit means you accept the updated terms.</P>
        </LegalPage>
    );
}
