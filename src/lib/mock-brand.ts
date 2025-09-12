import { BrandProfile } from './types';

export const mockBrand: BrandProfile = {
  accountId: 'dev-account-123',
  brand: {
    name: 'TechFlow Solutions',
    industry: 'Software Development',
    description: 'A modern software consultancy specializing in AI-powered business solutions and digital transformation.',
    oneLineDescription: 'Transforming businesses through intelligent software solutions',
    audienceSummary: 'Tech-savvy business owners, CTOs, and decision-makers at mid-size companies looking to modernize their operations',
    valueProp: 'We turn complex business challenges into elegant software solutions that drive growth and efficiency',
    
    // Tone and voice
    tone: 'professional',
    targetAudience: 'Business leaders and technical decision-makers',
    
    // Visual identity
    logoUrl: 'https://via.placeholder.com/200x80/0066CC/FFFFFF?text=TechFlow',
    primaryColorHex: '#0066CC',
    secondaryColorHexes: ['#00A3E0', '#7B68EE', '#20B2AA'],
    fontName: 'Inter',
    
    // Content preferences
    wordsWeLove: [
      'innovative',
      'efficient',
      'scalable',
      'intelligent',
      'streamlined',
      'cutting-edge',
      'transformation',
      'optimization',
      'automation',
      'growth-driven'
    ],
    wordsToAvoid: [
      'cheap',
      'basic',
      'outdated',
      'complicated',
      'expensive',
      'slow',
      'legacy',
      'manual',
      'inefficient'
    ],
    
    // Hero items/services
    heroItems: [
      'AI-powered business automation',
      'Cloud migration and optimization',
      'Custom software development',
      'Digital transformation consulting',
      'Data analytics and insights'
    ],
    
    // Visual style
    imageStyleNote: 'Clean, modern, tech-focused imagery with blue and white color scheme. Prefer abstract tech illustrations, office environments, and professional team photos.',
    exampleImageUrls: [
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400'
    ]
  },
  updatedAt: new Date().toISOString()
};

export const mockBrandVariations = {
  restaurant: {
    accountId: 'dev-restaurant-456',
    brand: {
      name: 'Bella Vista Bistro',
      industry: 'Restaurant & Food Service',
      description: 'An upscale Italian bistro featuring authentic recipes, fresh ingredients, and a warm, welcoming atmosphere.',
      oneLineDescription: 'Authentic Italian cuisine with a modern twist in the heart of downtown',
      audienceSummary: 'Food enthusiasts, couples seeking romantic dining, and professionals looking for quality lunch options',
      valueProp: 'Experience the true taste of Italy with locally-sourced ingredients and time-honored recipes',
      
      tone: 'warm',
      targetAudience: 'Food lovers and dining enthusiasts',
      
      logoUrl: 'https://via.placeholder.com/200x80/8B4513/FFFFFF?text=Bella+Vista',
      primaryColorHex: '#8B4513',
      secondaryColorHexes: ['#D2691E', '#CD853F', '#F4A460'],
      fontName: 'Playfair Display',
      
      wordsWeLove: [
        'authentic',
        'fresh',
        'artisanal',
        'traditional',
        'flavorful',
        'handcrafted',
        'seasonal',
        'locally-sourced',
        'family-recipe',
        'memorable'
      ],
      wordsToAvoid: [
        'fast',
        'processed',
        'artificial',
        'generic',
        'mass-produced',
        'frozen',
        'instant',
        'cheap',
        'rushed'
      ],
      
      heroItems: [
        'Handmade pasta dishes',
        'Wood-fired pizzas',
        'Fresh seafood specials',
        'Artisanal desserts',
        'Curated wine selection'
      ],
      
      imageStyleNote: 'Warm, inviting food photography with rich colors. Focus on plated dishes, cooking process, and cozy restaurant atmosphere.',
      exampleImageUrls: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'
      ]
    },
    updatedAt: new Date().toISOString()
  },

  fitness: {
    accountId: 'dev-fitness-789',
    brand: {
      name: 'Peak Performance Gym',
      industry: 'Fitness & Wellness',
      description: 'A premium fitness facility offering personal training, group classes, and state-of-the-art equipment for all fitness levels.',
      oneLineDescription: 'Unlock your potential with personalized fitness solutions and expert guidance',
      audienceSummary: 'Health-conscious individuals, fitness enthusiasts, and people starting their wellness journey',
      valueProp: 'Transform your body and mind with our comprehensive approach to fitness and wellness',
      
      tone: 'motivational',
      targetAudience: 'Fitness enthusiasts and health-conscious individuals',
      
      logoUrl: 'https://via.placeholder.com/200x80/FF6B35/FFFFFF?text=Peak+Performance',
      primaryColorHex: '#FF6B35',
      secondaryColorHexes: ['#F7931E', '#FFD23F', '#06FFA5'],
      fontName: 'Montserrat',
      
      wordsWeLove: [
        'strength',
        'transformation',
        'dedication',
        'results',
        'empowerment',
        'breakthrough',
        'excellence',
        'commitment',
        'achievement',
        'unstoppable'
      ],
      wordsToAvoid: [
        'easy',
        'effortless',
        'lazy',
        'quick-fix',
        'shortcut',
        'passive',
        'comfortable',
        'settling',
        'mediocre'
      ],
      
      heroItems: [
        'Personal training sessions',
        'High-intensity group classes',
        'Strength and conditioning',
        'Nutrition coaching',
        'Recovery and wellness services'
      ],
      
      imageStyleNote: 'Dynamic, energetic imagery showing people in action. Bright, motivational colors with focus on movement, strength, and achievement.',
      exampleImageUrls: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
        'https://images.unsplash.com/photo-1549476464-37392f717541?w=400'
      ]
    },
    updatedAt: new Date().toISOString()
  }
};
