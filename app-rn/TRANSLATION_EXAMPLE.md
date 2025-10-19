# How to Use Translations in Your App

## Basic Usage

```typescript
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('common.loading')}</Text>
      <Text>{t('home.title')}</Text>
    </View>
  );
};
```

## With Variables

```typescript
const { t } = useTranslation();

<Text>{t('profile.age', { age: 25 })}</Text>
// English: "25 years old"
// Spanish: "25 años"

<Text>{t('profile.distance', { distance: 2.5 })}</Text>
// English: "2.5 mi away"
// Spanish: "2.5 mi de distancia"
```

## Change Language Manually

```typescript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();

// Change to Spanish
i18n.changeLanguage('es');

// Change to English
i18n.changeLanguage('en');

// Get current language
const currentLang = i18n.language;
```

## Example: Update HomeScreen

```typescript
import { useTranslation } from 'react-i18next';

export const HomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>{t('home.title')}</Text>
      </View>
      
      <FlatList
        data={users}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('home.noUsers')}</Text>
            <Text style={styles.emptySubtext}>
              {t('home.checkLocation')}
            </Text>
          </View>
        }
      />
    </View>
  );
};
```

## Supported Languages

Currently configured:
- **English (en)** - Default
- **Spanish (es)**

To add more languages:
1. Create `src/locales/[language-code].json` (e.g., `fr.json`, `de.json`)
2. Add translations following the same structure
3. Import and add to `src/config/i18n.ts`:

```typescript
import fr from '../locales/fr.json';

resources: {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr }, // Add new language
}
```

## How It Works

1. **Auto-Detection**: App automatically detects device language on startup
2. **Fallback**: If translation missing, falls back to English
3. **OTA Updates**: Translation changes can be pushed via OTA updates
4. **No Rebuild**: Adding/changing translations doesn't require app store update
