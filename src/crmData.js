// Real CRM API data based on integration experience with these platforms
// Covers: data objects, key endpoints, webhook events, field mappings, and sync conflicts

export const PLATFORMS = {
  ghl: {
    id: 'ghl',
    name: 'GoHighLevel',
    short: 'GHL',
    color: '#3a8a5c',
    icon: '🟢',
    description: 'All-in-one marketing & CRM platform. Dominant in RE marketing agencies.',
    baseUrl: 'https://rest.gohighlevel.com/v1',
    authType: 'API Key (Bearer)',
    objects: [
      { id: 'contact', label: 'Contact', fields: ['id', 'firstName', 'lastName', 'email', 'phone', 'tags', 'customField', 'source', 'dateAdded'] },
      { id: 'opportunity', label: 'Opportunity', fields: ['id', 'name', 'monetaryValue', 'pipelineId', 'pipelineStageId', 'status', 'contactId'] },
      { id: 'pipeline', label: 'Pipeline', fields: ['id', 'name', 'stages[]'] },
      { id: 'task', label: 'Task', fields: ['id', 'title', 'body', 'dueDate', 'assignedTo', 'contactId', 'completed'] },
      { id: 'note', label: 'Note', fields: ['id', 'body', 'contactId', 'dateAdded'] },
      { id: 'calendar_event', label: 'Calendar Event', fields: ['id', 'title', 'calendarId', 'startTime', 'endTime', 'contactId'] },
    ],
    endpoints: [
      { method: 'GET', path: '/contacts/{id}', desc: 'Get contact by ID' },
      { method: 'POST', path: '/contacts', desc: 'Create new contact' },
      { method: 'PUT', path: '/contacts/{id}', desc: 'Update contact' },
      { method: 'POST', path: '/contacts/lookup', desc: 'Lookup by email/phone' },
      { method: 'GET', path: '/opportunities/{id}', desc: 'Get opportunity' },
      { method: 'POST', path: '/opportunities', desc: 'Create opportunity' },
      { method: 'PUT', path: '/opportunities/{id}/status', desc: 'Update opp status' },
      { method: 'GET', path: '/pipelines', desc: 'List all pipelines' },
      { method: 'POST', path: '/appointments', desc: 'Book calendar event' },
    ],
    webhooks: [
      { event: 'ContactCreate', desc: 'Fires when a new contact is added', payload: ['contact_id', 'first_name', 'last_name', 'email', 'phone', 'tags'] },
      { event: 'ContactUpdate', desc: 'Fires on any contact field change', payload: ['contact_id', 'changed_fields', 'new_values'] },
      { event: 'OpportunityCreate', desc: 'Fires when opp is created', payload: ['opportunity_id', 'pipeline_id', 'stage_id', 'contact_id', 'monetary_value'] },
      { event: 'OpportunityStageUpdate', desc: 'Fires when opp moves stages', payload: ['opportunity_id', 'old_stage', 'new_stage'] },
      { event: 'AppointmentScheduled', desc: 'Fires when calendar event booked', payload: ['calendar_id', 'contact_id', 'start_time', 'end_time'] },
      { event: 'InboundMessage', desc: 'Fires on incoming SMS/email', payload: ['contact_id', 'message_type', 'body', 'direction'] },
    ]
  },

  fub: {
    id: 'fub',
    name: 'Follow Up Boss',
    short: 'FUB',
    color: '#4a72b8',
    icon: '🔵',
    description: 'Zillow-owned CRM. Strong lead routing and agent collaboration.',
    baseUrl: 'https://api.followupboss.com/v1',
    authType: 'Basic Auth (API Key as username)',
    objects: [
      { id: 'people', label: 'Person (Lead)', fields: ['id', 'firstName', 'lastName', 'emails[]', 'phones[]', 'tags[]', 'stage', 'source', 'assignedTo', 'created'] },
      { id: 'deal', label: 'Deal', fields: ['id', 'personId', 'price', 'stage', 'type', 'propertyAddress', 'closingDate'] },
      { id: 'event', label: 'Event (Activity)', fields: ['id', 'personId', 'type', 'message', 'created'] },
      { id: 'task', label: 'Task', fields: ['id', 'personId', 'name', 'description', 'dueDate', 'assignedTo', 'completed'] },
      { id: 'note', label: 'Note', fields: ['id', 'personId', 'subject', 'body', 'created'] },
    ],
    endpoints: [
      { method: 'GET', path: '/people/{id}', desc: 'Get person by ID' },
      { method: 'POST', path: '/people', desc: 'Create new person' },
      { method: 'PUT', path: '/people/{id}', desc: 'Update person' },
      { method: 'POST', path: '/events', desc: 'Log activity/event' },
      { method: 'GET', path: '/deals', desc: 'List deals' },
      { method: 'POST', path: '/deals', desc: 'Create deal' },
      { method: 'POST', path: '/tasks', desc: 'Create task' },
      { method: 'POST', path: '/notes', desc: 'Create note on person' },
    ],
    webhooks: [
      { event: 'peopleCreated', desc: 'New person/lead added', payload: ['id', 'firstName', 'lastName', 'emails', 'phones', 'source', 'assignedTo'] },
      { event: 'peopleUpdated', desc: 'Person record updated', payload: ['id', 'updatedFields'] },
      { event: 'peopleStageUpdated', desc: 'Lead stage changed', payload: ['id', 'oldStage', 'newStage'] },
      { event: 'dealCreated', desc: 'New deal created', payload: ['id', 'personId', 'price', 'stage'] },
      { event: 'taskCompleted', desc: 'Task marked complete', payload: ['id', 'personId', 'name'] },
    ]
  },

  kvcore: {
    id: 'kvcore',
    name: 'kvCORE',
    short: 'kvCORE',
    color: '#7e5bb5',
    icon: '🟣',
    description: 'Inside Real Estate platform. Enterprise-grade with IDX and marketing.',
    baseUrl: 'https://api.kvcore.com/v2',
    authType: 'OAuth 2.0 + API Key',
    objects: [
      { id: 'lead', label: 'Lead', fields: ['id', 'first_name', 'last_name', 'email', 'phone', 'source', 'status', 'agent_id', 'created_at'] },
      { id: 'smart_campaign', label: 'Smart Campaign', fields: ['id', 'name', 'type', 'status', 'lead_count'] },
      { id: 'property_alert', label: 'Property Alert', fields: ['id', 'lead_id', 'criteria', 'frequency'] },
      { id: 'transaction', label: 'Transaction', fields: ['id', 'lead_id', 'property_address', 'price', 'stage', 'closing_date'] },
      { id: 'activity', label: 'Activity', fields: ['id', 'lead_id', 'type', 'description', 'timestamp'] },
    ],
    endpoints: [
      { method: 'GET', path: '/leads/{id}', desc: 'Get lead by ID' },
      { method: 'POST', path: '/leads', desc: 'Create new lead' },
      { method: 'PUT', path: '/leads/{id}', desc: 'Update lead' },
      { method: 'POST', path: '/leads/{id}/activities', desc: 'Log activity' },
      { method: 'GET', path: '/leads/{id}/alerts', desc: 'Get property alerts' },
      { method: 'POST', path: '/leads/{id}/campaigns', desc: 'Assign to campaign' },
      { method: 'GET', path: '/transactions', desc: 'List transactions' },
    ],
    webhooks: [
      { event: 'lead.created', desc: 'New lead registered', payload: ['lead_id', 'first_name', 'last_name', 'email', 'phone', 'source'] },
      { event: 'lead.updated', desc: 'Lead record changed', payload: ['lead_id', 'changed_fields'] },
      { event: 'lead.property_viewed', desc: 'Lead viewed a listing', payload: ['lead_id', 'property_id', 'mls_number'] },
      { event: 'lead.status_changed', desc: 'Lead status updated', payload: ['lead_id', 'old_status', 'new_status'] },
    ]
  },

  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    short: 'HubSpot',
    color: '#c47234',
    icon: '🟠',
    description: 'Full marketing/sales/service platform. Common in teams using inbound.',
    baseUrl: 'https://api.hubapi.com/crm/v3',
    authType: 'OAuth 2.0 / Private App Token',
    objects: [
      { id: 'contact', label: 'Contact', fields: ['id', 'firstname', 'lastname', 'email', 'phone', 'lifecyclestage', 'hs_lead_status', 'createdate'] },
      { id: 'deal', label: 'Deal', fields: ['id', 'dealname', 'amount', 'dealstage', 'pipeline', 'closedate', 'hubspot_owner_id'] },
      { id: 'company', label: 'Company', fields: ['id', 'name', 'domain', 'industry', 'numberofemployees'] },
      { id: 'ticket', label: 'Ticket', fields: ['id', 'subject', 'content', 'hs_pipeline_stage', 'hs_ticket_priority'] },
      { id: 'engagement', label: 'Engagement', fields: ['id', 'type', 'timestamp', 'metadata', 'associations'] },
      { id: 'note', label: 'Note', fields: ['id', 'hs_note_body', 'hs_timestamp', 'associations'] },
    ],
    endpoints: [
      { method: 'GET', path: '/objects/contacts/{id}', desc: 'Get contact' },
      { method: 'POST', path: '/objects/contacts', desc: 'Create contact' },
      { method: 'PATCH', path: '/objects/contacts/{id}', desc: 'Update contact' },
      { method: 'POST', path: '/objects/contacts/search', desc: 'Search contacts' },
      { method: 'GET', path: '/objects/deals/{id}', desc: 'Get deal' },
      { method: 'POST', path: '/objects/deals', desc: 'Create deal' },
      { method: 'POST', path: '/objects/contacts/batch/create', desc: 'Batch create contacts' },
      { method: 'PUT', path: '/crm/v4/objects/contacts/{id}/associations', desc: 'Set associations' },
    ],
    webhooks: [
      { event: 'contact.creation', desc: 'New contact created', payload: ['objectId', 'propertyName', 'propertyValue', 'changeSource'] },
      { event: 'contact.propertyChange', desc: 'Contact property changed', payload: ['objectId', 'propertyName', 'propertyValue'] },
      { event: 'deal.creation', desc: 'New deal created', payload: ['objectId', 'propertyName', 'propertyValue'] },
      { event: 'deal.propertyChange', desc: 'Deal property changed', payload: ['objectId', 'propertyName', 'propertyValue'] },
      { event: 'contact.associationChange', desc: 'Contact association added/removed', payload: ['objectId', 'associationType', 'toObjectId'] },
    ]
  },

  lofty: {
    id: 'lofty',
    name: 'Lofty',
    short: 'Lofty',
    color: '#b84a5a',
    icon: '🔴',
    description: 'Formerly Chime. RE CRM with IDX, marketing automation, and AI assistant.',
    baseUrl: 'https://api.lofty.com/v1',
    authType: 'API Key + Webhook Secret',
    objects: [
      { id: 'lead', label: 'Lead', fields: ['id', 'first_name', 'last_name', 'email', 'phone', 'source', 'stage', 'assigned_agent', 'registered_at'] },
      { id: 'smart_plan', label: 'Smart Plan', fields: ['id', 'name', 'lead_id', 'status', 'steps_completed'] },
      { id: 'showing', label: 'Showing', fields: ['id', 'lead_id', 'property_address', 'date', 'status', 'agent_id'] },
      { id: 'transaction', label: 'Transaction', fields: ['id', 'lead_id', 'type', 'property', 'price', 'stage'] },
      { id: 'activity', label: 'Activity', fields: ['id', 'lead_id', 'type', 'details', 'timestamp'] },
    ],
    endpoints: [
      { method: 'GET', path: '/leads/{id}', desc: 'Get lead by ID' },
      { method: 'POST', path: '/leads', desc: 'Create new lead' },
      { method: 'PUT', path: '/leads/{id}', desc: 'Update lead' },
      { method: 'POST', path: '/leads/{id}/tags', desc: 'Add tags to lead' },
      { method: 'POST', path: '/leads/{id}/activities', desc: 'Log activity' },
      { method: 'GET', path: '/showings', desc: 'List showings' },
      { method: 'POST', path: '/showings', desc: 'Create showing' },
    ],
    webhooks: [
      { event: 'lead_created', desc: 'New lead registered', payload: ['lead_id', 'first_name', 'last_name', 'email', 'phone', 'source'] },
      { event: 'lead_updated', desc: 'Lead info changed', payload: ['lead_id', 'updated_fields'] },
      { event: 'lead_stage_changed', desc: 'Lead moved stages', payload: ['lead_id', 'from_stage', 'to_stage'] },
      { event: 'showing_scheduled', desc: 'Showing booked', payload: ['showing_id', 'lead_id', 'property', 'date'] },
      { event: 'property_inquiry', desc: 'Lead inquired about listing', payload: ['lead_id', 'property_id', 'mls_number', 'message'] },
    ]
  }
}

// Define how data objects map between platforms
export const FIELD_MAPPINGS = {
  'ghl-fub': {
    mappings: [
      { from: 'Contact', to: 'Person (Lead)', fields: { 'firstName': 'firstName', 'lastName': 'lastName', 'email': 'emails[0]', 'phone': 'phones[0]', 'tags': 'tags', 'source': 'source' }, confidence: 'high' },
      { from: 'Opportunity', to: 'Deal', fields: { 'monetaryValue': 'price', 'status': 'stage', 'contactId': 'personId' }, confidence: 'medium' },
      { from: 'Task', to: 'Task', fields: { 'title': 'name', 'body': 'description', 'dueDate': 'dueDate', 'contactId': 'personId' }, confidence: 'high' },
      { from: 'Note', to: 'Note', fields: { 'body': 'body', 'contactId': 'personId' }, confidence: 'high' },
    ],
    conflicts: [
      { type: 'structural', desc: 'GHL uses single email/phone strings; FUB uses arrays — pick index 0 on sync or risk data loss on multi-value contacts' },
      { type: 'naming', desc: 'GHL "Opportunity" = FUB "Deal" — different terminology, similar data shape' },
      { type: 'pipeline', desc: 'Pipeline stages don\'t map 1:1 — GHL has custom pipeline builder, FUB has fixed stage progression. Requires stage mapping table.' },
      { type: 'webhook', desc: 'GHL webhooks fire on any contact update (noisy); FUB has separate stage-change events. Dedup logic needed on GHL side.' },
    ]
  },
  'ghl-kvcore': {
    mappings: [
      { from: 'Contact', to: 'Lead', fields: { 'firstName': 'first_name', 'lastName': 'last_name', 'email': 'email', 'phone': 'phone', 'source': 'source' }, confidence: 'high' },
      { from: 'Opportunity', to: 'Transaction', fields: { 'monetaryValue': 'price', 'status': 'stage' }, confidence: 'medium' },
      { from: 'Calendar Event', to: 'Activity', fields: { 'title': 'description', 'startTime': 'timestamp' }, confidence: 'low' },
    ],
    conflicts: [
      { type: 'auth', desc: 'GHL uses simple API key; kvCORE requires OAuth 2.0. Token refresh logic needed for long-running syncs.' },
      { type: 'naming', desc: 'GHL "Contact" = kvCORE "Lead" — different object names, same concept' },
      { type: 'custom_fields', desc: 'GHL custom fields are key-value pairs; kvCORE custom fields have typed schemas. Mapping requires field-type validation.' },
      { type: 'rate_limit', desc: 'kvCORE has aggressive rate limits (~60 req/min). GHL webhook bursts can trigger 429s — queue + backoff required.' },
    ]
  },
  'ghl-hubspot': {
    mappings: [
      { from: 'Contact', to: 'Contact', fields: { 'firstName': 'firstname', 'lastName': 'lastname', 'email': 'email', 'phone': 'phone', 'tags': 'hs_lead_status', 'source': 'lifecyclestage' }, confidence: 'high' },
      { from: 'Opportunity', to: 'Deal', fields: { 'name': 'dealname', 'monetaryValue': 'amount', 'pipelineStageId': 'dealstage' }, confidence: 'medium' },
      { from: 'Task', to: 'Engagement', fields: { 'title': 'metadata.title', 'body': 'metadata.body' }, confidence: 'low' },
      { from: 'Note', to: 'Note', fields: { 'body': 'hs_note_body' }, confidence: 'high' },
    ],
    conflicts: [
      { type: 'association', desc: 'HubSpot uses explicit association objects between contacts/deals/companies. GHL uses simple contactId references. Association creation is an extra API call.' },
      { type: 'pipeline', desc: 'HubSpot pipelines are more structured with required properties per stage. GHL pipelines are free-form. Stage mapping must include required field defaults.' },
      { type: 'batch', desc: 'HubSpot supports batch operations (up to 100 per call). GHL is single-record. Use batching on HubSpot side for bulk syncs.' },
      { type: 'webhook', desc: 'HubSpot webhooks fire per-property, not per-record. A single GHL contact update might need to trigger multiple HubSpot property-change events.' },
    ]
  },
  'ghl-lofty': {
    mappings: [
      { from: 'Contact', to: 'Lead', fields: { 'firstName': 'first_name', 'lastName': 'last_name', 'email': 'email', 'phone': 'phone', 'source': 'source', 'tags': 'tags' }, confidence: 'high' },
      { from: 'Opportunity', to: 'Transaction', fields: { 'monetaryValue': 'price', 'status': 'stage' }, confidence: 'medium' },
      { from: 'Calendar Event', to: 'Showing', fields: { 'title': 'property_address', 'startTime': 'date', 'contactId': 'lead_id' }, confidence: 'low' },
    ],
    conflicts: [
      { type: 'showing', desc: 'Lofty has first-class Showing objects tied to MLS data. GHL uses generic calendar events. Mapping requires enriching GHL events with property data.' },
      { type: 'smart_plan', desc: 'Lofty Smart Plans are automated sequences with no GHL equivalent. Cannot bidirectionally sync — one-way lead push only.' },
      { type: 'webhook', desc: 'Lofty property_inquiry events have no GHL counterpart. These are RE-specific signals lost in generic CRM sync.' },
    ]
  },
  'fub-kvcore': {
    mappings: [
      { from: 'Person (Lead)', to: 'Lead', fields: { 'firstName': 'first_name', 'lastName': 'last_name', 'emails[0]': 'email', 'phones[0]': 'phone', 'source': 'source', 'stage': 'status' }, confidence: 'high' },
      { from: 'Deal', to: 'Transaction', fields: { 'price': 'price', 'stage': 'stage', 'propertyAddress': 'property_address' }, confidence: 'high' },
      { from: 'Event (Activity)', to: 'Activity', fields: { 'type': 'type', 'message': 'description' }, confidence: 'medium' },
    ],
    conflicts: [
      { type: 'structural', desc: 'FUB emails/phones are arrays; kvCORE uses single values. First array element maps, rest are lost unless stored in custom fields.' },
      { type: 'auth', desc: 'FUB uses Basic Auth; kvCORE uses OAuth 2.0. Different credential management patterns needed per direction.' },
      { type: 'stage', desc: 'FUB lead stages are text-based; kvCORE uses numeric status codes. Mapping table required with fallback for unknown stages.' },
    ]
  },
  'fub-hubspot': {
    mappings: [
      { from: 'Person (Lead)', to: 'Contact', fields: { 'firstName': 'firstname', 'lastName': 'lastname', 'emails[0]': 'email', 'phones[0]': 'phone', 'stage': 'lifecyclestage' }, confidence: 'high' },
      { from: 'Deal', to: 'Deal', fields: { 'price': 'amount', 'stage': 'dealstage', 'type': 'pipeline' }, confidence: 'medium' },
      { from: 'Note', to: 'Note', fields: { 'body': 'hs_note_body' }, confidence: 'high' },
    ],
    conflicts: [
      { type: 'association', desc: 'HubSpot requires explicit contact-deal associations. FUB uses personId on deals. Extra association API call needed on HubSpot side.' },
      { type: 'structural', desc: 'FUB arrays (emails[], phones[]) → HubSpot single fields. HubSpot contact can have multiple emails via secondary properties, but primary field is singular.' },
      { type: 'search', desc: 'HubSpot dedup uses email search via POST /search. FUB has no native dedup — must check before creating to avoid duplicates.' },
    ]
  },
  'fub-lofty': {
    mappings: [
      { from: 'Person (Lead)', to: 'Lead', fields: { 'firstName': 'first_name', 'lastName': 'last_name', 'emails[0]': 'email', 'phones[0]': 'phone', 'source': 'source' }, confidence: 'high' },
      { from: 'Deal', to: 'Transaction', fields: { 'price': 'price', 'stage': 'stage', 'propertyAddress': 'property' }, confidence: 'high' },
      { from: 'Task', to: 'Activity', fields: { 'name': 'details', 'dueDate': 'timestamp' }, confidence: 'low' },
    ],
    conflicts: [
      { type: 'showing', desc: 'Lofty has dedicated Showing objects; FUB tracks showings as Events/Activities. Data shape mismatch — Lofty showings have MLS context that FUB events lack.' },
      { type: 'structural', desc: 'FUB array fields vs Lofty single-value fields. Same pattern as other FUB integrations — index 0 or custom field mapping.' },
      { type: 'stage', desc: 'FUB and Lofty both have lead stages but with different names and counts. Custom mapping table needed.' },
    ]
  },
  'kvcore-hubspot': {
    mappings: [
      { from: 'Lead', to: 'Contact', fields: { 'first_name': 'firstname', 'last_name': 'lastname', 'email': 'email', 'phone': 'phone', 'source': 'lifecyclestage' }, confidence: 'high' },
      { from: 'Transaction', to: 'Deal', fields: { 'price': 'amount', 'stage': 'dealstage', 'property_address': 'dealname' }, confidence: 'medium' },
      { from: 'Activity', to: 'Engagement', fields: { 'type': 'type', 'description': 'metadata.body' }, confidence: 'medium' },
    ],
    conflicts: [
      { type: 'auth', desc: 'Both use OAuth 2.0 but with different grant flows. kvCORE uses client_credentials; HubSpot uses authorization_code. Different token lifecycle management.' },
      { type: 'rate_limit', desc: 'kvCORE ~60 req/min, HubSpot ~100 req/10s (burst). Queue architecture must handle both rate limit patterns simultaneously.' },
      { type: 'association', desc: 'HubSpot association model has no kvCORE equivalent. Contact-company-deal relationships must be constructed on HubSpot side from flat kvCORE data.' },
    ]
  },
  'kvcore-lofty': {
    mappings: [
      { from: 'Lead', to: 'Lead', fields: { 'first_name': 'first_name', 'last_name': 'last_name', 'email': 'email', 'phone': 'phone', 'source': 'source', 'status': 'stage' }, confidence: 'high' },
      { from: 'Transaction', to: 'Transaction', fields: { 'price': 'price', 'stage': 'stage', 'property_address': 'property' }, confidence: 'high' },
      { from: 'Activity', to: 'Activity', fields: { 'type': 'type', 'description': 'details', 'timestamp': 'timestamp' }, confidence: 'high' },
    ],
    conflicts: [
      { type: 'auth', desc: 'kvCORE OAuth 2.0 vs Lofty API Key. Simpler Lofty side, but kvCORE token refresh adds complexity.' },
      { type: 'campaign', desc: 'kvCORE Smart Campaigns ≠ Lofty Smart Plans. Both are automation sequences but with incompatible step definitions. Cannot sync — manual recreation needed.' },
      { type: 'property', desc: 'Both platforms have deep MLS/IDX integration. Property alert sync could conflict if both platforms are searching the same MLS feed.' },
    ]
  },
  'hubspot-lofty': {
    mappings: [
      { from: 'Contact', to: 'Lead', fields: { 'firstname': 'first_name', 'lastname': 'last_name', 'email': 'email', 'phone': 'phone', 'lifecyclestage': 'stage' }, confidence: 'high' },
      { from: 'Deal', to: 'Transaction', fields: { 'amount': 'price', 'dealstage': 'stage', 'dealname': 'property' }, confidence: 'medium' },
      { from: 'Engagement', to: 'Activity', fields: { 'type': 'type', 'metadata.body': 'details' }, confidence: 'medium' },
    ],
    conflicts: [
      { type: 'association', desc: 'HubSpot contact-company-deal associations have no Lofty equivalent. Lofty is flat — lead → transaction. Company layer is lost.' },
      { type: 'showing', desc: 'Lofty Showing objects have no HubSpot counterpart. Must map to HubSpot meetings/engagements, losing MLS property context.' },
      { type: 'lifecycle', desc: 'HubSpot lifecyclestage is a global concept (subscriber→lead→MQL→SQL→customer). Lofty stages are RE-specific (new→contacted→showing→under_contract→closed). Semantic mapping required.' },
    ]
  }
}

// Get the mapping key for any two platforms (order-independent)
export function getMappingKey(a, b) {
  const pairs = Object.keys(FIELD_MAPPINGS)
  const forward = `${a}-${b}`
  const reverse = `${b}-${a}`
  if (pairs.includes(forward)) return { key: forward, reversed: false }
  if (pairs.includes(reverse)) return { key: reverse, reversed: true }
  return null
}
