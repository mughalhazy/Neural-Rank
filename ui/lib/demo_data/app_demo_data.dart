import '../core/models/ui_models.dart';
import '../core/models/view_state.dart';
import '../core/theme/app_theme.dart';

const dashboardMetrics = [
  MetricData(
    label: 'Visibility Lift',
    value: '+18%',
    delta: '7-day momentum',
    tone: AppColors.accent,
    caption: 'Play Store listing',
    meaning: 'Visibility is improving, but conversion intent still needs work.',
    action: 'Route gains to content',
  ),
  MetricData(
    label: 'Critical Actions',
    value: '06',
    delta: '2 urgent now',
    tone: AppColors.warning,
    caption: 'Cross-module queue',
    meaning: 'Two actions affect trust or high-intent discovery now.',
    action: 'Work urgent first',
  ),
  MetricData(
    label: 'Review Sentiment',
    value: '4.2',
    delta: '+0.3 after fixes',
    tone: AppColors.success,
    caption: 'Recent cohort',
    meaning: 'Recent fixes are helping, but sync complaints still cluster.',
    action: 'Inspect review cluster',
  ),
];

const dashboardPriority = PriorityActionData(
  title: 'Rewrite weak screenshot headline around offline study intent',
  summary:
      'Keyword gains are being suppressed by lower conversion on your top-ranking learning queries.',
  priority: 'High impact',
  timeEstimate: '25 min',
  tone: AppColors.accent2,
);

const dashboardInsights = [
  InsightData(
    title: 'Ranking gains are concentrated in note-taking terms',
    summary:
        'You are winning visibility in secondary intent clusters, but the highest-value “exam prep” phrases still trail competitors.',
    evidence: [
      '+11 average movement',
      '3 rising clusters',
      '1 stalled head term',
    ],
    tone: AppColors.accent,
    impact: 'Expand',
    action: 'Move winning terms into listing copy',
    nextStep: 'Next: inspect note-taking cluster',
  ),
  InsightData(
    title: 'Negative review clusters are focused on sync friction',
    summary:
        'Review analysis shows complaints are narrow and fixable, which makes this a clean action surface rather than a broad quality issue.',
    evidence: ['29% mention sync', '14-day recurrence', 'High fix leverage'],
    tone: AppColors.warning,
    impact: 'Urgent',
    action: 'Repair sync trust messaging',
    nextStep: 'Next: open sync cluster',
  ),
];

const dashboardFeature = ModuleFeatureData(
  module: 'Unified command',
  feature: 'Today\'s growth move',
  commercialJob: 'See the one task most likely to improve growth today.',
  decisionSupported:
      'Choose whether to fix trust, improve copy, or protect rankings first.',
  valueCreated: 'You spend less time comparing reports and more time acting.',
  primaryAction: 'Fix the sync trust issue before doing smaller cleanup tasks.',
  actionType: 'workflow_coordination_action',
  tone: AppColors.accent2,
  evidence: [
    FeatureEvidenceData(
      label: 'Tasks waiting',
      value: '06',
      interpretation: 'Two need attention before they hurt conversion.',
    ),
    FeatureEvidenceData(
      label: 'Same problem found in',
      value: '3 sources',
      interpretation: 'Reviews, listing copy, and rankings point to trust.',
    ),
    FeatureEvidenceData(
      label: 'Work queue',
      value: '1 queue',
      interpretation: 'Everything is ordered so you know what to do first.',
    ),
  ],
  backendActionTypes: [
    'unified_workflow_action',
    'workflow_coordination_action',
  ],
);

const dashboardCommercialFeatures = [
  CommercialFeatureData(
    name: 'What to do today',
    description: 'Shows the highest-priority growth task.',
    iconKey: 'flash',
  ),
  CommercialFeatureData(
    name: 'Growth task list',
    description: 'Keeps all recommended actions in order.',
    iconKey: 'workflow',
  ),
  CommercialFeatureData(
    name: 'Priority summary',
    description: 'Shows what needs attention first.',
    iconKey: 'priority',
  ),
  CommercialFeatureData(
    name: 'Upcoming tools',
    description: 'Previews advanced modules not active yet.',
    iconKey: 'lock',
  ),
];

const keywordRows = [
  TrendRowData(
    label: 'study notes app',
    primaryValue: '#4',
    secondaryValue: 'Vol 18k',
    delta: '+3',
    isPositive: true,
    flag: 'Actionable',
    explanation: 'Movement and volume justify content support.',
    action: 'Add phrase to screenshot captions',
  ),
  TrendRowData(
    label: 'exam revision app',
    primaryValue: '#9',
    secondaryValue: 'Vol 11k',
    delta: '-2',
    isPositive: false,
    flag: 'Needs copy work',
    explanation: 'The term is slipping because copy intent is weak.',
    action: 'Rewrite opening around exam prep',
  ),
  TrendRowData(
    label: 'offline flashcards',
    primaryValue: '#2',
    secondaryValue: 'Vol 7k',
    delta: '+1',
    isPositive: true,
    flag: 'Defend',
    explanation: 'Strong position should be protected before expansion.',
    action: 'Defend with matching metadata',
  ),
];

const rankRows = [
  TrendRowData(
    label: 'Top 3 coverage',
    primaryValue: '12 keywords',
    secondaryValue: 'from 30 tracked',
    delta: '+4',
    isPositive: true,
    flag: 'Strong',
    explanation: 'Top positions are expanding in mid-tail terms.',
    action: 'Convert gains into durable coverage',
  ),
  TrendRowData(
    label: 'Decaying terms',
    primaryValue: '5 keywords',
    secondaryValue: 'lost momentum',
    delta: '-5',
    isPositive: false,
    flag: 'Urgent',
    explanation: 'Losses need recovery before new expansion.',
    action: 'Inspect decays first',
  ),
  TrendRowData(
    label: 'Unranked opportunities',
    primaryValue: '8 keywords',
    secondaryValue: 'high-intent gaps',
    delta: '+8',
    isPositive: true,
    flag: 'Expand',
    explanation: 'Unranked terms show validated growth space.',
    action: 'Build expansion targets',
  ),
];

const competitorRows = [
  TrendRowData(
    label: 'exam prep rival A',
    primaryValue: '+14 SOV',
    secondaryValue: 'Messaging lead',
    delta: '+4',
    isPositive: false,
    flag: 'Gap',
    explanation: 'Rival wins through clearer promise, not volume alone.',
    action: 'Compare screenshot headline',
  ),
  TrendRowData(
    label: 'notes rival B',
    primaryValue: '-6 SOV',
    secondaryValue: 'Weak reviews',
    delta: '+2',
    isPositive: true,
    flag: 'Exploit',
    explanation: 'Their review weakness creates a trust opening.',
    action: 'Position against trust gap',
  ),
  TrendRowData(
    label: 'flashcards rival C',
    primaryValue: 'Parity',
    secondaryValue: 'Creative contest',
    delta: '0',
    isPositive: true,
    flag: 'Monitor',
    explanation: 'Parity means no urgent move yet.',
    action: 'Watch creative movement',
  ),
];

const keywordFeature = ModuleFeatureData(
  module: 'Keyword Analysis',
  feature: 'Keywords worth using',
  commercialJob: 'Find search terms that are strong enough to act on.',
  decisionSupported:
      'Choose which keywords belong in your listing, captions, or metadata.',
  valueCreated: 'You avoid chasing long keyword lists with no clear payoff.',
  primaryAction: 'Add "study notes app" to screenshot captions this cycle.',
  actionType: 'prioritize_high_opportunity_keywords',
  tone: AppColors.accent,
  evidence: [
    FeatureEvidenceData(
      label: 'Good targets',
      value: '3 terms',
      interpretation: 'These terms have enough signal to use now.',
    ),
    FeatureEvidenceData(
      label: 'Best mover',
      value: '+3 ranks',
      interpretation: 'This phrase is already moving in the right direction.',
    ),
    FeatureEvidenceData(
      label: 'Best placement',
      value: 'Caption fit',
      interpretation: 'Use it where users can see it quickly.',
    ),
  ],
  backendActionTypes: [
    'prioritize_high_opportunity_keywords',
    'review_keyword_expansion_set',
  ],
);

const keywordCommercialFeatures = [
  CommercialFeatureData(
    name: 'Find keywords to use',
    description: 'Shows search terms worth targeting.',
    iconKey: 'search',
  ),
  CommercialFeatureData(
    name: 'Pick best opportunities',
    description: 'Ranks keywords by usefulness.',
    iconKey: 'priority',
  ),
  CommercialFeatureData(
    name: 'Track keyword movement',
    description: 'Shows which terms are gaining or slipping.',
    iconKey: 'rank',
  ),
  CommercialFeatureData(
    name: 'Know where to place keywords',
    description: 'Recommends title, metadata, caption, or copy placement.',
    iconKey: 'content',
  ),
  CommercialFeatureData(
    name: 'Keyword tasks',
    description: 'Turns keyword findings into actions.',
    iconKey: 'check',
  ),
];

const rankFeature = ModuleFeatureData(
  module: 'Rank Tracking',
  feature: 'Ranking changes that need action',
  commercialJob: 'See which rankings to protect, recover, or ignore.',
  decisionSupported:
      'Choose whether to recover falling terms or defend winning terms.',
  valueCreated: 'You do not waste time reacting to every small movement.',
  primaryAction: 'Check the 5 falling terms before adding new keyword work.',
  actionType: 'investigate_rank_decline',
  tone: AppColors.warning,
  evidence: [
    FeatureEvidenceData(
      label: 'Top 3 coverage',
      value: '+4',
      interpretation: 'Recent gains are worth protecting.',
    ),
    FeatureEvidenceData(
      label: 'Falling terms',
      value: '5',
      interpretation: 'These need review before they drop further.',
    ),
    FeatureEvidenceData(
      label: 'New openings',
      value: '8 gaps',
      interpretation: 'Expansion can wait until recovery work is clear.',
    ),
  ],
  backendActionTypes: [
    'investigate_rank_decline',
    'reinforce_rank_improvement',
  ],
);

const rankCommercialFeatures = [
  CommercialFeatureData(
    name: 'Find rankings to fix',
    description: 'Shows terms losing position.',
    iconKey: 'alert',
  ),
  CommercialFeatureData(
    name: 'Protect winning rankings',
    description: 'Highlights terms gaining position.',
    iconKey: 'check',
  ),
  CommercialFeatureData(
    name: 'Spot new ranking opportunities',
    description: 'Shows terms worth expanding into.',
    iconKey: 'insight',
  ),
  CommercialFeatureData(
    name: 'Recover falling terms',
    description: 'Creates actions for rank drops.',
    iconKey: 'workflow',
  ),
  CommercialFeatureData(
    name: 'Ranking tasks',
    description: 'Turns movement into next steps.',
    iconKey: 'priority',
  ),
];

const dashboardState = ScreenStateConfig(
  status: ViewStatus.success,
  loadingTitle: 'Refreshing command view',
  loadingMessage: 'Cross-module insights are being collected and prioritized.',
  emptyTitle: 'No target selected yet',
  emptyMessage:
      'Connect a website or app target to start generating command-level insight.',
  errorTitle: 'Command view unavailable',
  errorMessage:
      'We could not assemble the dashboard workflow from the current source state.',
);

const keywordState = ScreenStateConfig(
  status: ViewStatus.success,
  loadingTitle: 'Refreshing keyword opportunity map',
  loadingMessage:
      'Keyword clusters and opportunity signals are being recalculated.',
  emptyTitle: 'No keywords tracked yet',
  emptyMessage:
      'Add seed keywords or connect a source to build the keyword opportunity board.',
  errorTitle: 'Keyword analysis unavailable',
  errorMessage:
      'We could not load keyword opportunity data from the current target.',
);

const rankState = ScreenStateConfig(
  status: ViewStatus.success,
  loadingTitle: 'Refreshing rank movements',
  loadingMessage: 'Tracked positions and deltas are being updated.',
  emptyTitle: 'No ranking history yet',
  emptyMessage: 'Start rank tracking to compare movement and uncover decays.',
  errorTitle: 'Rank tracking unavailable',
  errorMessage: 'We could not load rank movement data for this target.',
);

const contentState = ScreenStateConfig(
  status: ViewStatus.success,
  loadingTitle: 'Reviewing listing and content quality',
  loadingMessage: 'Message coverage and metadata quality are being analyzed.',
  emptyTitle: 'No listing content loaded',
  emptyMessage:
      'Connect a source or add listing copy to unlock content insight.',
  errorTitle: 'Content insights unavailable',
  errorMessage:
      'We could not derive content and listing insight from the current source.',
);

const reviewState = ScreenStateConfig(
  status: ViewStatus.success,
  loadingTitle: 'Clustering review feedback',
  loadingMessage:
      'Complaint and request patterns are being grouped into action-ready themes.',
  emptyTitle: 'No reviews available',
  emptyMessage:
      'Connect a review source to unlock trust and feature-request patterns.',
  errorTitle: 'Review analysis unavailable',
  errorMessage: 'We could not process review feedback for the current target.',
);

const settingsState = ScreenStateConfig(
  status: ViewStatus.success,
  loadingTitle: 'Loading workspace configuration',
  loadingMessage:
      'Integration status and visibility settings are being checked.',
  emptyTitle: 'No configuration present',
  emptyMessage: 'Add a target and source settings to initialize the workspace.',
  errorTitle: 'Settings unavailable',
  errorMessage: 'We could not load workspace configuration details.',
);

const contentInsights = [
  InsightData(
    title: 'Description opening is too feature-led',
    summary:
        'The first scan block lists features before user outcome, which weakens relevance and conversion on intent-driven store traffic.',
    evidence: ['Low verb clarity', 'No urgency cue', 'Weak category signal'],
    tone: AppColors.warning,
    impact: 'High impact',
    action: 'Rewrite opening around user outcome',
    nextStep: 'Next: create rewrite task',
  ),
  InsightData(
    title: 'Metadata coverage is broad but uneven',
    summary:
        'Your supporting long-tail terms are present, but their density is inconsistent across the title, subtitle, and screenshot captions.',
    evidence: ['Title coverage 83%', 'Caption gap 41%', 'Subtitle gap 22%'],
    tone: AppColors.accent2,
    impact: 'Action-ready',
    action: 'Rebalance terms across metadata',
    nextStep: 'Next: inspect caption gap',
  ),
];

const contentFeature = ModuleFeatureData(
  module: 'Content / Listing Insights',
  feature: 'Listing fixes that matter',
  commercialJob: 'Find the listing copy that should be improved first.',
  decisionSupported:
      'Choose which section to rewrite before doing smaller copy edits.',
  valueCreated: 'Your listing changes become focused, not random.',
  primaryAction: 'Rewrite the opening around the user outcome and exam prep.',
  actionType: 'improve_listing_quality',
  tone: AppColors.accent2,
  evidence: [
    FeatureEvidenceData(
      label: 'Opening copy',
      value: 'Feature-led',
      interpretation: 'It says what the app has, not why users should care.',
    ),
    FeatureEvidenceData(
      label: 'Screenshot captions',
      value: '41%',
      interpretation: 'Important phrases are missing where users scan first.',
    ),
    FeatureEvidenceData(
      label: 'Priority',
      value: 'High',
      interpretation: 'This affects both search fit and conversion.',
    ),
  ],
  backendActionTypes: ['improve_listing_quality', 'improve_content_quality'],
);

const contentCommercialFeatures = [
  CommercialFeatureData(
    name: 'Fix weak listing copy',
    description: 'Shows which listing section needs rewriting first.',
    iconKey: 'content',
  ),
  CommercialFeatureData(
    name: 'Improve the opening',
    description: 'Detects weak first-impression copy.',
    iconKey: 'flash',
  ),
  CommercialFeatureData(
    name: 'Find missing keywords',
    description: 'Shows metadata and listing keyword gaps.',
    iconKey: 'keyword',
  ),
  CommercialFeatureData(
    name: 'Improve screenshot text',
    description: 'Finds caption and message gaps.',
    iconKey: 'insight',
  ),
  CommercialFeatureData(
    name: 'Rewrite tasks',
    description: 'Turns listing issues into copy actions.',
    iconKey: 'check',
  ),
];

const reviewInsights = [
  InsightData(
    title:
        'Sync complaints are damaging trust more than rating average suggests',
    summary:
        'Recent comments are emotionally strong and likely suppressing conversion even though the overall score remains healthy.',
    evidence: [
      '17 repeated complaints',
      '1.8x stronger language',
      'Last update linked',
    ],
    tone: AppColors.danger,
    impact: 'Urgent',
    action: 'Repair sync messaging',
    nextStep: 'Next: inspect sync cluster',
  ),
  InsightData(
    title: 'Feature-request demand centers on export and reminders',
    summary:
        'This cluster is positive in tone and can be converted into roadmap messaging plus release-note wins.',
    evidence: ['62 requests', 'High retention tie', 'Positive sentiment'],
    tone: AppColors.success,
    impact: 'Expand',
    action: 'Turn requests into roadmap messaging',
    nextStep: 'Next: draft release-note copy',
  ),
];

const reviewFeature = ModuleFeatureData(
  module: 'Review Analysis',
  feature: 'Review issues that can hurt trust',
  commercialJob: 'Find the customer complaints that need action first.',
  decisionSupported:
      'Choose whether to respond, fix the product issue, or monitor it.',
  valueCreated: 'You see trust problems before the rating average hides them.',
  primaryAction: 'Review the sync complaints and write the trust response.',
  actionType: 'investigate_complaint_cluster',
  tone: AppColors.danger,
  evidence: [
    FeatureEvidenceData(
      label: 'Sync complaints',
      value: '17 mentions',
      interpretation: 'This is repeated often enough to act on.',
    ),
    FeatureEvidenceData(
      label: 'Tone',
      value: 'High',
      interpretation: 'Users describe this as a trust problem.',
    ),
    FeatureEvidenceData(
      label: 'Feature requests',
      value: '62 requests',
      interpretation: 'Export and reminders are worth tracking.',
    ),
  ],
  backendActionTypes: [
    'investigate_complaint_cluster',
    'evaluate_feature_request_pattern',
  ],
);

const reviewCommercialFeatures = [
  CommercialFeatureData(
    name: 'Find trust issues',
    description: 'Detects repeated complaints that can hurt conversion.',
    iconKey: 'alert',
  ),
  CommercialFeatureData(
    name: 'See complaint themes',
    description: 'Groups similar review problems.',
    iconKey: 'review',
  ),
  CommercialFeatureData(
    name: 'Review complaint examples',
    description: 'Shows the comments behind an issue.',
    iconKey: 'insight',
  ),
  CommercialFeatureData(
    name: 'Find user requests',
    description: 'Detects repeated feature requests.',
    iconKey: 'search',
  ),
  CommercialFeatureData(
    name: 'Review tasks',
    description: 'Turns feedback into actions.',
    iconKey: 'priority',
  ),
  CommercialFeatureData(
    name: 'Check review source',
    description: 'Shows whether review data is connected.',
    iconKey: 'settings',
  ),
];

const reviewClusters = [
  ReviewClusterData(
    title: 'Sync friction',
    mentionCount: 17,
    sentimentLabel: 'High frustration',
    summary:
        'This cluster is trust-damaging because users describe unreliability in workflow-critical moments.',
    examples: ['Notes missing', 'Sync delay', 'Offline mismatch'],
    tone: AppColors.danger,
  ),
  ReviewClusterData(
    title: 'Export and reminders',
    mentionCount: 62,
    sentimentLabel: 'Constructive demand',
    summary:
        'The cluster is positive in tone and should be treated as roadmap plus messaging opportunity.',
    examples: ['PDF export', 'Study reminders', 'Calendar sync'],
    tone: AppColors.success,
  ),
];

const settingsInsights = [
  InsightData(
    title: 'Keyword provider is still a mock adapter',
    summary:
        'Production decisions should wait until the live keyword source is connected.',
    evidence: ['Mock adapter', 'Workspace confidence: medium'],
    tone: AppColors.warning,
    impact: 'Monitor',
    action: 'Connect live keyword source',
    nextStep: 'Next: update integration settings',
  ),
];

const competitorInsights = [
  InsightData(
    title: 'Rival A is winning through clearer exam-prep messaging',
    summary:
        'The pressure is messaging-led, so the response should focus on creative clarity before keyword expansion.',
    evidence: ['+14 SOV', 'Messaging lead', 'Head terms affected'],
    tone: AppColors.warning,
    impact: 'High impact',
    action: 'Compare screenshot promise',
    nextStep: 'Next: open rivalry map',
  ),
];

const optimizationInsights = [
  InsightData(
    title: 'Rewrite work should start with listing opening',
    summary:
        'The opening copy affects both high-intent discovery and conversion, so it outranks lower-value metadata cleanup.',
    evidence: ['Exam-prep intent gap', 'High-volume terms', 'Action-ready'],
    tone: AppColors.accent2,
    impact: 'High impact',
    action: 'Prepare opening rewrite',
    nextStep: 'Next: add rewrite task',
  ),
];

const creativeInsights = [
  InsightData(
    title: 'Screenshot promise does not match strongest intent',
    summary:
        'Users see the creative promise before deeper listing copy, so message mismatch can suppress conversion.',
    evidence: [
      'Offline study intent',
      'Weak headline clarity',
      'Rival contrast',
    ],
    tone: AppColors.signal,
    impact: 'Action-ready',
    action: 'Rewrite screenshot headline',
    nextStep: 'Next: review creative critique',
  ),
];

const workflowInsights = [
  InsightData(
    title: 'Sync trust and listing intent should move together',
    summary:
        'Review repair and content rewrite affect the same conversion path, so they should be handled as one workflow.',
    evidence: ['Review risk', 'Copy gap', 'Shared conversion impact'],
    tone: AppColors.accent,
    impact: 'High impact',
    action: 'Bundle into workflow',
    nextStep: 'Next: open workflow queue',
  ),
];

const competitorComparisons = [
  CompetitorComparisonData(
    name: 'Exam Prep Rival A',
    visibility: 'Leads in head terms',
    reviewTrust: 'Mixed due to subscription complaints',
    messaging: 'Strong urgency framing',
    advantage: 'Messaging edge',
    tone: AppColors.warning,
  ),
  CompetitorComparisonData(
    name: 'Notes Rival B',
    visibility: 'Weakening in study-note cluster',
    reviewTrust: 'Lower than target app',
    messaging: 'Generic feature-led copy',
    advantage: 'Trust opening',
    tone: AppColors.accent,
  ),
];

const settingsFeature = ModuleFeatureData(
  module: 'Settings',
  feature: 'Data source status',
  commercialJob: 'Check whether the current data is safe to use.',
  decisionSupported: 'Decide if this workspace is ready for real decisions.',
  valueCreated: 'You avoid acting on stale or demo data.',
  primaryAction:
      'Connect the live keyword source before using this in production.',
  actionType: 'source_validation_action',
  tone: AppColors.warning,
  evidence: [
    FeatureEvidenceData(
      label: 'Keyword source',
      value: 'Mock',
      interpretation: 'This is still demo data.',
    ),
    FeatureEvidenceData(
      label: 'Confidence',
      value: 'Medium',
      interpretation: 'Good enough for UI review, not final decisions.',
    ),
    FeatureEvidenceData(
      label: 'Visible modules',
      value: 'MVP visible',
      interpretation: 'Advanced modules are previewed but not active.',
    ),
  ],
  backendActionTypes: ['source_validation_action', 'module_activation_action'],
);

const settingsCommercialFeatures = [
  CommercialFeatureData(
    name: 'Check data readiness',
    description: 'Shows whether data is safe to use.',
    iconKey: 'check',
  ),
  CommercialFeatureData(
    name: 'Set your target',
    description: 'Manages the app or website being tracked.',
    iconKey: 'search',
  ),
  CommercialFeatureData(
    name: 'Connect sources',
    description: 'Manages integrations.',
    iconKey: 'workflow',
  ),
  CommercialFeatureData(
    name: 'Control active tools',
    description: 'Shows which modules are active or gated.',
    iconKey: 'lock',
  ),
  CommercialFeatureData(
    name: 'Check workspace trust',
    description: 'Shows freshness and confidence.',
    iconKey: 'insight',
  ),
];

const competitorFeature = ModuleFeatureData(
  module: 'Competitor Analysis',
  feature: 'Competitor gaps to close',
  commercialJob: 'See where a rival is beating your listing.',
  decisionSupported:
      'Choose whether to respond with keywords, copy, rankings, or trust work.',
  valueCreated: 'Competitor review becomes a response plan, not observation.',
  primaryAction: 'Improve the headline against Exam Prep Rival A.',
  actionType: 'competitive_gap_action',
  tone: AppColors.warning,
  evidence: [
    FeatureEvidenceData(
      label: 'Rival lead',
      value: '+14 SOV',
      interpretation: 'Rival A is ahead on important terms.',
    ),
    FeatureEvidenceData(
      label: 'Main gap',
      value: 'Messaging',
      interpretation: 'The first fix should be message clarity.',
    ),
    FeatureEvidenceData(
      label: 'Opening',
      value: 'Rival B',
      interpretation: 'A rival weakness can become your trust angle.',
    ),
  ],
  backendActionTypes: [
    'competitive_gap_action',
    'competitor_monitoring_action',
  ],
);

const competitorCommercialFeatures = [
  CommercialFeatureData(
    name: 'Find competitor advantages',
    description: 'Shows where rivals are stronger.',
    iconKey: 'competitor',
  ),
  CommercialFeatureData(
    name: 'See your biggest gap',
    description: 'Identifies the main area to improve.',
    iconKey: 'alert',
  ),
  CommercialFeatureData(
    name: 'Find trust openings',
    description: 'Spots competitor weaknesses you can use.',
    iconKey: 'insight',
  ),
  CommercialFeatureData(
    name: 'Plan competitor response',
    description: 'Turns rival pressure into actions.',
    iconKey: 'priority',
  ),
];

const optimizationFeature = ModuleFeatureData(
  module: 'Optimization Layer',
  feature: 'Fix list for your listing',
  commercialJob: 'Turn findings into specific edits.',
  decisionSupported:
      'Choose which edit should happen before lower-impact cleanup.',
  valueCreated: 'You get a clear fix list instead of another report.',
  primaryAction: 'Rewrite the listing opening before metadata cleanup.',
  actionType: 'optimization_improvement_action',
  tone: AppColors.accent2,
  evidence: [
    FeatureEvidenceData(
      label: 'Section',
      value: 'Opening',
      interpretation: 'This is the first part users scan.',
    ),
    FeatureEvidenceData(
      label: 'Issue',
      value: 'Coverage gap',
      interpretation: 'Important search phrases are missing early.',
    ),
    FeatureEvidenceData(
      label: 'Value',
      value: 'High',
      interpretation: 'One edit can help both search and conversion.',
    ),
  ],
  backendActionTypes: [
    'optimization_improvement_action',
    'optimization_monitoring_action',
  ],
);

const optimizationCommercialFeatures = [
  CommercialFeatureData(
    name: 'Get a fix list',
    description: 'Turns findings into specific edits.',
    iconKey: 'check',
  ),
  CommercialFeatureData(
    name: 'Fix weak sections',
    description: 'Shows which section needs improvement.',
    iconKey: 'content',
  ),
  CommercialFeatureData(
    name: 'Complete missing metadata',
    description: 'Identifies incomplete metadata.',
    iconKey: 'filter',
  ),
  CommercialFeatureData(
    name: 'Repair keyword coverage',
    description: 'Shows where important terms are missing.',
    iconKey: 'keyword',
  ),
  CommercialFeatureData(
    name: 'Optimization tasks',
    description: 'Gives execution-ready improvements.',
    iconKey: 'priority',
  ),
];

const creativeFeature = ModuleFeatureData(
  module: 'Creative / Messaging',
  feature: 'Screenshot message fix',
  commercialJob: 'Find the screenshot message that should be rewritten.',
  decisionSupported:
      'Choose what to rewrite before testing new creative variants.',
  valueCreated: 'Creative feedback becomes practical, not subjective.',
  primaryAction: 'Rewrite the hero screenshot around offline study.',
  actionType: 'messaging_suggestion_action',
  tone: AppColors.signal,
  evidence: [
    FeatureEvidenceData(
      label: 'Asset',
      value: 'Hero shot',
      interpretation: 'The first impression does not match user intent.',
    ),
    FeatureEvidenceData(
      label: 'Issue',
      value: 'Headline clarity',
      interpretation: 'The result is not clear fast enough.',
    ),
    FeatureEvidenceData(
      label: 'Best theme',
      value: 'Offline study',
      interpretation: 'This should lead the screenshot copy.',
    ),
  ],
  backendActionTypes: [
    'messaging_suggestion_action',
    'messaging_monitoring_action',
  ],
);

const creativeCommercialFeatures = [
  CommercialFeatureData(
    name: 'Improve screenshot message',
    description: 'Shows which screenshot copy is unclear.',
    iconKey: 'content',
  ),
  CommercialFeatureData(
    name: 'Fix weak headline',
    description: 'Detects headline clarity issues.',
    iconKey: 'alert',
  ),
  CommercialFeatureData(
    name: 'Match user intent',
    description: 'Checks whether messaging matches what users want.',
    iconKey: 'insight',
  ),
  CommercialFeatureData(
    name: 'Improve call to action',
    description: 'Finds missing or weak CTAs.',
    iconKey: 'flash',
  ),
  CommercialFeatureData(
    name: 'Creative tasks',
    description: 'Turns message issues into rewrite actions.',
    iconKey: 'check',
  ),
];

const workflowFeature = ModuleFeatureData(
  module: 'Unified Workflow Layer',
  feature: 'One ordered work queue',
  commercialJob: 'Bring all module actions into one clear sequence.',
  decisionSupported:
      'Choose what to do first across reviews, content, keywords, and rankings.',
  valueCreated: 'You stop switching between separate tools and lists.',
  primaryAction:
      'Handle sync trust repair and listing rewrite as one work item.',
  actionType: 'unified_workflow_action',
  tone: AppColors.accent,
  evidence: [
    FeatureEvidenceData(
      label: 'Modules feeding queue',
      value: '4 active',
      interpretation: 'The active modules all contribute tasks.',
    ),
    FeatureEvidenceData(
      label: 'First task',
      value: 'Trust repair',
      interpretation: 'This affects trust and conversion together.',
    ),
    FeatureEvidenceData(
      label: 'Order',
      value: 'Sequenced',
      interpretation: 'The highest-impact work stays first.',
    ),
  ],
  backendActionTypes: [
    'unified_workflow_action',
    'workflow_coordination_action',
  ],
);

const workflowCommercialFeatures = [
  CommercialFeatureData(
    name: 'See everything in one queue',
    description: 'Combines actions across modules.',
    iconKey: 'workflow',
  ),
  CommercialFeatureData(
    name: 'Know what to do first',
    description: 'Orders tasks by importance.',
    iconKey: 'priority',
  ),
  CommercialFeatureData(
    name: 'Group related work',
    description: 'Bundles connected actions together.',
    iconKey: 'filter',
  ),
  CommercialFeatureData(
    name: 'Track execution flow',
    description: 'Shows how module tasks move toward outcomes.',
    iconKey: 'rank',
  ),
];

const queueActions = [
  PriorityActionData(
    title: 'Repair sync messaging in release notes and onboarding',
    summary:
        'Reduce trust loss by acknowledging the issue and clarifying the current fix path.',
    priority: 'Urgent',
    timeEstimate: '15 min',
    tone: AppColors.danger,
  ),
  PriorityActionData(
    title: 'Reorder description opening around exam-prep intent',
    summary:
        'Align high-volume terms with a clearer user-outcome promise in the first 180 characters.',
    priority: 'High',
    timeEstimate: '20 min',
    tone: AppColors.accent2,
  ),
  PriorityActionData(
    title: 'Defend rising note-taking keyword cluster',
    summary:
        'Keep momentum by carrying the winning phrase set into screenshot captions and short description.',
    priority: 'Medium',
    timeEstimate: '30 min',
    tone: AppColors.accent,
  ),
];

const lockedModules = [
  ModulePreviewData(
    title: 'Competitor Analysis',
    summary:
        'Compare ranking pressure, review themes, and messaging gaps across target rivals.',
    badge: 'Built, gated for MVP',
    availability: ModuleAvailability.locked,
    metrics: ['3 rival sets', 'Share-of-voice map', 'Gap board'],
  ),
  ModulePreviewData(
    title: 'Optimization Layer',
    summary:
        'Turn insights into editable metadata, listing, and copy recommendations.',
    badge: 'Built, gated for MVP',
    availability: ModuleAvailability.locked,
    metrics: ['Copy rewrites', 'Priority bundles', 'Execution board'],
  ),
  ModulePreviewData(
    title: 'Unified Workflow Layer',
    summary:
        'Combine cross-module insight, priority, and action into one coordinated operating queue.',
    badge: 'Built, gated for MVP',
    availability: ModuleAvailability.locked,
    metrics: ['Cross-module queue', 'Owner states', 'Flow orchestration'],
  ),
  ModulePreviewData(
    title: 'Creative / Messaging',
    summary:
        'Score screenshot narrative and message clarity against conversion intent.',
    badge: 'Built, gated for MVP',
    availability: ModuleAvailability.locked,
    metrics: ['Creative critique', 'Hook variants', 'Conversion notes'],
  ),
];

const workflowActions = [
  PriorityActionData(
    title: 'Route sync trust issue into release-note and listing fixes',
    summary:
        'Connect review pain to content and messaging work so one issue becomes one coordinated execution path.',
    priority: 'High',
    timeEstimate: '35 min',
    tone: AppColors.accent2,
  ),
  PriorityActionData(
    title: 'Bundle rising keyword cluster with screenshot headline update',
    summary:
        'Treat discoverability and conversion as one workflow instead of two disconnected tools.',
    priority: 'Medium',
    timeEstimate: '30 min',
    tone: AppColors.accent,
  ),
];
