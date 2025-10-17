# Pre-Launch Checklist for Smasher

Complete this checklist before submitting to Google Play Store.

## 📱 Frontend Checklist

### Code & Configuration
- [ ] API_BASE_URL updated to production backend
- [ ] WebSocket URL updated to production
- [ ] App name set correctly in strings.xml
- [ ] Package name is unique (com.smasherapp)
- [ ] Version code and version name set
- [ ] App icons replaced (all densities)
- [ ] Splash screen configured
- [ ] ProGuard rules configured
- [ ] Signing keystore generated
- [ ] Signing configured in build.gradle
- [ ] gradle.properties has signing credentials
- [ ] Production build tested

### Features Testing
- [ ] Age gate works (blocks under 18)
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Profile creation works
- [ ] Photo upload works
- [ ] Video upload works
- [ ] Profile editing works
- [ ] Home screen shows users
- [ ] Distance calculation works
- [ ] View other profiles works
- [ ] Add to favorites works
- [ ] Remove from favorites works
- [ ] Favorites screen shows list
- [ ] Send message works
- [ ] Receive messages works (real-time)
- [ ] Chat list shows conversations
- [ ] Read receipts work (premium)
- [ ] Block user works
- [ ] Report user works
- [ ] Settings screen works
- [ ] Premium subscription works

### Performance
- [ ] App launches in < 3 seconds
- [ ] Smooth scrolling
- [ ] No memory leaks
- [ ] Images load quickly
- [ ] No crashes during testing
- [ ] Works on Android 7.0+
- [ ] Works on different screen sizes
- [ ] Battery usage is reasonable

### Permissions
- [ ] Location permission requested with explanation
- [ ] Camera permission requested with explanation
- [ ] Storage permission requested with explanation
- [ ] All permissions justified in description

## 🖥️ Backend Checklist

### Deployment
- [ ] Backend deployed to production (Fly.io)
- [ ] Database created and configured
- [ ] All migrations run successfully
- [ ] Environment variables set
- [ ] SSL/HTTPS enabled
- [ ] Health check endpoint works (/health)
- [ ] Version endpoint works (/version)
- [ ] CORS configured for production

### Database
- [ ] Users table exists
- [ ] Profiles table exists
- [ ] Messages table exists
- [ ] Buddies table exists (new migration)
- [ ] Blocks table exists
- [ ] Reports table exists
- [ ] Subscriptions table exists
- [ ] Indexes created for performance
- [ ] Foreign keys configured
- [ ] Database backups configured

### Services
- [ ] Cloudflare R2 bucket created
- [ ] R2 CORS policy configured
- [ ] R2 credentials in environment
- [ ] Resend account created
- [ ] Resend API key in environment
- [ ] Domain verified in Resend
- [ ] Test email sent successfully

### API Testing
- [ ] POST /auth/register works
- [ ] POST /auth/login works
- [ ] GET /profiles/:id works
- [ ] PUT /profiles works
- [ ] POST /media/signed-upload works
- [ ] GET /buddies works
- [ ] POST /buddies/:id works
- [ ] DELETE /buddies/:id works
- [ ] GET /buddies/check/:id works
- [ ] POST /messages works
- [ ] GET /messages/:userId works
- [ ] POST /blocks works
- [ ] POST /reports works
- [ ] WebSocket connection works
- [ ] Real-time messages work

### Security
- [ ] JWT secret is strong and unique
- [ ] Passwords are hashed
- [ ] Rate limiting enabled
- [ ] SQL injection protection (TypeORM)
- [ ] XSS protection
- [ ] HTTPS enforced
- [ ] Sensitive data not logged
- [ ] Error messages don't expose internals

## 📄 Legal & Documentation

### Required Documents
- [ ] Privacy Policy created
- [ ] Privacy Policy hosted online
- [ ] Terms of Service created
- [ ] Terms of Service hosted online
- [ ] Privacy Policy URL added to app
- [ ] Terms of Service URL added to app
- [ ] Contact email configured
- [ ] Support email configured

### Content
- [ ] App description written
- [ ] Short description (80 chars)
- [ ] Full description (up to 4000 chars)
- [ ] What's New / Release notes
- [ ] Feature list complete
- [ ] Screenshots taken (2-8)
- [ ] Feature graphic created (1024x500)
- [ ] App icon created (512x512)
- [ ] Promotional text written

## 🏪 Google Play Console

### Account Setup
- [ ] Developer account created ($25 paid)
- [ ] Account verified
- [ ] Payment profile set up
- [ ] Tax information submitted

### App Listing
- [ ] App created in Console
- [ ] App name set
- [ ] Short description added
- [ ] Full description added
- [ ] Screenshots uploaded (2-8)
- [ ] Feature graphic uploaded
- [ ] App icon uploaded
- [ ] Category selected (Social/Dating)
- [ ] Tags/keywords added
- [ ] Contact email set
- [ ] Privacy Policy URL added
- [ ] Website URL added (if applicable)

### Content Rating
- [ ] Content rating questionnaire completed
- [ ] Rating received (likely Mature 17+)
- [ ] Rating certificate downloaded

### App Content
- [ ] Target audience set (18+)
- [ ] Ads declaration completed
- [ ] Data safety form completed
- [ ] Privacy policy link verified
- [ ] App access instructions (if needed)
- [ ] Government apps declaration

### Release
- [ ] Production track selected
- [ ] AAB file uploaded
- [ ] Version code matches build
- [ ] Version name matches build
- [ ] Release notes added
- [ ] Countries/regions selected
- [ ] Pricing set (Free with IAP)

## 🧪 Testing

### Device Testing
- [ ] Tested on Android 7.0 (minimum)
- [ ] Tested on Android 10 (mid-range)
- [ ] Tested on Android 14 (latest)
- [ ] Tested on small screen (< 5")
- [ ] Tested on medium screen (5-6")
- [ ] Tested on large screen (6"+)
- [ ] Tested on tablet (optional)

### Scenario Testing
- [ ] New user registration flow
- [ ] Existing user login flow
- [ ] Profile creation and editing
- [ ] Photo/video upload
- [ ] Discovering users
- [ ] Adding favorites
- [ ] Sending messages
- [ ] Receiving messages
- [ ] Blocking users
- [ ] Reporting users
- [ ] Premium subscription purchase
- [ ] App works offline (gracefully)
- [ ] App handles network errors

### Edge Cases
- [ ] No internet connection
- [ ] Poor internet connection
- [ ] Location permission denied
- [ ] Camera permission denied
- [ ] Storage permission denied
- [ ] Empty states (no users, no messages)
- [ ] Large images
- [ ] Long text in bio
- [ ] Special characters in text
- [ ] Multiple rapid taps
- [ ] Background/foreground transitions

## 🔐 Security Testing

- [ ] Cannot access other users' data
- [ ] Cannot edit other users' profiles
- [ ] Blocked users can't message you
- [ ] Reported users are logged
- [ ] JWT tokens expire properly
- [ ] Invalid tokens rejected
- [ ] SQL injection attempts fail
- [ ] XSS attempts fail
- [ ] HTTPS enforced
- [ ] Passwords not visible in logs

## 📊 Analytics & Monitoring

- [ ] Error tracking set up (Sentry, etc.)
- [ ] Analytics configured (Firebase, etc.)
- [ ] Crash reporting enabled
- [ ] Performance monitoring enabled
- [ ] Backend monitoring (uptime, etc.)
- [ ] Database monitoring
- [ ] Alert system configured

## 🚀 Pre-Submission

### Final Checks
- [ ] All features work as expected
- [ ] No known critical bugs
- [ ] App doesn't crash
- [ ] Performance is acceptable
- [ ] UI is polished
- [ ] All text is correct (no typos)
- [ ] All images are high quality
- [ ] App size is reasonable
- [ ] Build is signed correctly
- [ ] Version numbers are correct

### Documentation
- [ ] README updated
- [ ] API documentation complete
- [ ] Deployment guide complete
- [ ] Troubleshooting guide available
- [ ] Support documentation ready

### Team Readiness
- [ ] Support email monitored
- [ ] Team knows how to respond to reviews
- [ ] Bug fix process in place
- [ ] Update process documented
- [ ] Rollback plan exists

## 📝 Submission Checklist

- [ ] All above items completed
- [ ] AAB uploaded to Play Console
- [ ] Store listing complete
- [ ] Content rating received
- [ ] Data safety form submitted
- [ ] Privacy policy accessible
- [ ] Terms of service accessible
- [ ] Release notes written
- [ ] Countries selected
- [ ] Pricing confirmed
- [ ] Review submitted

## 🎯 Post-Submission

- [ ] Confirmation email received
- [ ] Review status monitored
- [ ] Team notified of submission
- [ ] Marketing materials prepared
- [ ] Social media accounts ready
- [ ] Support team briefed
- [ ] Monitoring dashboards checked

## ⏱️ Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Backend completion | 1-2 days | ⬜ |
| Frontend completion | 1-2 days | ⬜ |
| Testing | 2-3 days | ⬜ |
| Store preparation | 2-3 days | ⬜ |
| Submission | 1 day | ⬜ |
| Review | 1-7 days | ⬜ |
| **Total** | **7-17 days** | ⬜ |

## 🆘 Common Issues

### Rejection Reasons
- **Inappropriate content** → Ensure age gate works
- **Privacy policy missing** → Must be accessible
- **Permissions not justified** → Explain in description
- **Crashes** → Test thoroughly
- **Misleading content** → Accurate screenshots

### Quick Fixes
- Keep test account credentials ready
- Have video demo ready
- Document all features
- Respond to reviewer questions quickly

## ✅ Ready to Submit?

If all items are checked:
1. Double-check everything
2. Submit for review
3. Monitor email for updates
4. Respond to any questions promptly
5. Celebrate! 🎉

---

**Remember:** First submission may take longer. Be patient and responsive to reviewer feedback.

**Good luck with your launch! 🚀**
