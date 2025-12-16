const { z } = require('zod');

// Schema for incoming messages (WhatsApp, Web, etc.)
const incomingMessageSchema = z.object({
    source: z.enum(['whatsapp', 'instagram', 'messenger', 'web', 'sandbox']).default('web'),
    business_id: z.string().min(1, "business_id is required"),
    user_phone: z.string().min(5, "user_phone is too short"),
    message: z.string().min(1, "message cannot be empty").max(4000, "message too long"),
    metadata: z.record(z.any()).optional()
});

// Schema for manual replies from the dashboard and AI consumer
const manualReplySchema = z.object({
    business_id: z.string().min(1).optional(),
    to: z.string().min(1),
    message: z.string().min(1).max(4000),
    source: z.string().optional(),
    sender: z.string().optional(),
    chat_id: z.string().optional(),
    conversation_id: z.string().optional()
});

// Schema for RAG trigger
const ragTriggerSchema = z.object({
    business_id: z.string().min(1),
    document_id: z.string().min(1),
    file_url: z.string().url()
});

// Schema for VAPI call
const vapiCallSchema = z.object({
    to: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid E.164 phone number").optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid E.164 phone number").optional(),
    business_id: z.string().min(1).optional(),
    agent_id: z.string().optional(),
    user_name: z.string().optional(),
    phone_number_id: z.string().optional(),
    first_message: z.string().optional(),
    language: z.string().optional()
});

// Schema for WhatsApp Campaign
const waCampaignSchema = z.object({
    business_id: z.string().min(1),
    agent_id: z.string().optional(),
    contacts: z.array(z.object({
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
        name: z.string().optional()
    })).min(1),
    message: z.string().min(1).max(4000),
    delay: z.number().min(500).max(10000).default(2000)
});

module.exports = {
    incomingMessageSchema,
    manualReplySchema,
    ragTriggerSchema,
    vapiCallSchema,
    waCampaignSchema
};
