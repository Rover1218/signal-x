// English to Bengali transliteration utility
// Maps English phonemes to Bengali script equivalents

const consonantMap: { [key: string]: string } = {
    'k': 'ক', 'kh': 'খ', 'g': 'গ', 'gh': 'ঘ', 'ng': 'ঙ',
    'ch': 'চ', 'chh': 'ছ', 'j': 'জ', 'jh': 'ঝ',
    't': 'ট', 'th': 'ঠ', 'd': 'ড', 'dh': 'ঢ', 'n': 'ন',
    'p': 'প', 'ph': 'ফ', 'f': 'ফ', 'b': 'ব', 'bh': 'ভ', 'm': 'ম',
    'y': 'য়', 'r': 'র', 'l': 'ল', 'v': 'ভ', 'w': 'ও',
    'sh': 'শ', 's': 'স', 'h': 'হ',
    'c': 'ক', 'q': 'ক', 'x': 'ক্স', 'z': 'জ়',
};

const vowelMap: { [key: string]: string } = {
    'a': 'া', 'aa': 'া', 'i': 'ি', 'ee': 'ী', 'ii': 'ী',
    'u': 'ু', 'oo': 'ূ', 'uu': 'ূ',
    'e': 'ে', 'ai': 'ৈ', 'o': 'ো', 'au': 'ৌ', 'ou': 'ৌ',
    'ri': 'ৃ',
};

const independentVowelMap: { [key: string]: string } = {
    'a': 'অ', 'aa': 'আ', 'i': 'ই', 'ee': 'ঈ', 'ii': 'ঈ',
    'u': 'উ', 'oo': 'ঊ', 'uu': 'ঊ',
    'e': 'এ', 'ai': 'ঐ', 'o': 'ও', 'au': 'ঔ', 'ou': 'ঔ',
    'ri': 'ঋ',
};

// Common name patterns for better transliteration
const namePatterns: { [key: string]: string } = {
    'deep': 'দীপ',
    'jyoti': 'জ্যোতি',
    'deepjyoti': 'দীপজ্যোতি',
    'raj': 'রাজ',
    'kumar': 'কুমার',
    'sharma': 'শর্মা',
    'das': 'দাস',
    'sen': 'সেন',
    'roy': 'রায়',
    'dey': 'দে',
    'ghosh': 'ঘোষ',
    'bose': 'বসু',
    'banerjee': 'ব্যানার্জী',
    'mukherjee': 'মুখার্জী',
    'chatterjee': 'চ্যাটার্জী',
    'ganguly': 'গাঙ্গুলী',
    'chakraborty': 'চক্রবর্তী',
    'sarkar': 'সরকার',
    'mondal': 'মণ্ডল',
    'halder': 'হালদার',
    'paul': 'পাল',
    'saha': 'সাহা',
    'biswas': 'বিশ্বাস',
    'pal': 'পাল',
    'majumdar': 'মজুমদার',
    'kar': 'কর',
    'dutta': 'দত্ত',
    'gupta': 'গুপ্ত',
    'singh': 'সিং',
    'khan': 'খান',
    'ali': 'আলি',
    'ahmed': 'আহমেদ',
    'mohammad': 'মোহাম্মদ',
    'sheikh': 'শেখ',
    'amit': 'অমিত',
    'anil': 'অনিল',
    'ankit': 'অঙ্কিত',
    'arun': 'অরুণ',
    'ashok': 'অশোক',
    'suman': 'সুমন',
    'sunil': 'সুনীল',
    'ravi': 'রবি',
    'rahul': 'রাহুল',
    'priya': 'প্রিয়া',
    'neha': 'নেহা',
    'pooja': 'পূজা',
    'anjali': 'অঞ্জলি',
    'sunita': 'সুনীতা',
    'rekha': 'রেখা',
    'mamata': 'মমতা',
    'dipankar': 'দীপঙ্কর',
    'debashis': 'দেবাশীষ',
    'subhash': 'সুভাষ',
    'tapan': 'তপন',
    'partha': 'পার্থ',
    'sourav': 'সৌরভ',
    'souvik': 'সৌভিক',
    'sayan': 'সায়ন',
    'ayan': 'অয়ন',
    'arjun': 'অর্জুন',
    'krishna': 'কৃষ্ণ',
    'ram': 'রাম',
    'shyam': 'শ্যাম',
    'lakshmi': 'লক্ষ্মী',
    'saraswati': 'সরস্বতী',
    'durga': 'দুর্গা',
    'kali': 'কালী',
};

/**
 * Transliterates an English name to Bengali script
 * Uses pattern matching for common names and falls back to phonetic transliteration
 */
export function transliterateToBengali(name: string): string {
    if (!name) return '';

    // Split by spaces and process each word
    const words = name.toLowerCase().trim().split(/\s+/);
    const transliteratedWords = words.map(word => {
        // Check if we have a direct pattern match
        if (namePatterns[word]) {
            return namePatterns[word];
        }

        // Check for partial matches (compound names)
        for (const [pattern, bengali] of Object.entries(namePatterns)) {
            if (word === pattern) {
                return bengali;
            }
        }

        // Fall back to phonetic transliteration
        return phoneticTransliterate(word);
    });

    return transliteratedWords.join(' ');
}

function phoneticTransliterate(word: string): string {
    let result = '';
    let i = 0;
    let isFirstChar = true;

    while (i < word.length) {
        let matched = false;

        // Try matching longer sequences first (3 chars, then 2, then 1)
        for (let len = 3; len >= 1; len--) {
            const substr = word.substring(i, i + len);

            // Check consonants
            if (consonantMap[substr]) {
                result += consonantMap[substr];
                matched = true;
                i += len;

                // Check for following vowel
                let vowelMatched = false;
                for (let vlen = 2; vlen >= 1; vlen--) {
                    const vowelSubstr = word.substring(i, i + vlen);
                    if (vowelMap[vowelSubstr]) {
                        result += vowelMap[vowelSubstr];
                        i += vlen;
                        vowelMatched = true;
                        break;
                    }
                }

                // Add implicit 'অ' sound if no vowel follows and not end of word
                if (!vowelMatched && i < word.length) {
                    // Check if next char is a consonant - add halant for conjuncts
                    const nextChar = word[i];
                    if (consonantMap[nextChar] || (i + 1 < word.length && consonantMap[word.substring(i, i + 2)])) {
                        result += '্'; // Halant for consonant cluster
                    }
                }

                isFirstChar = false;
                break;
            }

            // Check vowels (independent form at start of word)
            if (isFirstChar && independentVowelMap[substr]) {
                result += independentVowelMap[substr];
                matched = true;
                i += len;
                isFirstChar = false;
                break;
            }
        }

        if (!matched) {
            // Keep original character if no mapping found
            result += word[i];
            i++;
            isFirstChar = false;
        }
    }

    return result;
}

/**
 * Get display name based on language
 * Returns Bengali transliteration if lang is 'bn', otherwise returns original name
 */
export function getLocalizedName(name: string, lang: 'en' | 'bn'): string {
    if (lang === 'bn') {
        return transliterateToBengali(name);
    }
    return name;
}
