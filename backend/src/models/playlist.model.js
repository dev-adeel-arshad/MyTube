import mongoose, {Schema} from "mongoose";

const historyEntrySchema = new Schema({
    action: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: false },
    video: { type: Schema.Types.ObjectId, ref: "Video", required: false },
    createdAt: { type: Date, default: Date.now }
}, {_id: false});


const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        default: null
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    history: {
        type: [historyEntrySchema],
        default: []
    }
}, {timestamps: true})

// Helper: prune history entries older than `days` (default 365)
export function pruneHistory(entries = [], now = new Date(), days = 365) {
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return entries.filter(e => new Date(e.createdAt) >= cutoff);
}

// Helper: format label for a date: Today, Yesterday, or dd/mm/yyyy
function formatDateLabel(date, now = new Date()) {
    const d = new Date(date);
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((day - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / (24 * 60 * 60 * 1000));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

// Helper: segment a list of history entries into labeled groups.
// Returns array: [{ label, items: [...] }, ...] sorted by newest first
export function segmentHistory(entries = [], now = new Date()) {
    const list = entries.slice().map(e => ({...e, createdAt: new Date(e.createdAt)}));
    list.sort((a,b) => b.createdAt - a.createdAt);
    const groupsMap = new Map();
    for (const e of list) {
        const label = formatDateLabel(e.createdAt, now);
        if (!groupsMap.has(label)) groupsMap.set(label, []);
        groupsMap.get(label).push(e);
    }
    const result = [];
    for (const [label, items] of groupsMap) result.push({label, items});
    return result;
}

// Instance method: add history entry and prune entries older than one year
playlistSchema.methods.addHistoryEntry = async function({action, user = null, video = null}) {
    const now = new Date();
    this.history.push({ action, user, video, createdAt: now });
    this.history = pruneHistory(this.history, now, 365);
    await this.save();
    return this;
}

export const Playlist = mongoose.model("Playlist", playlistSchema)
