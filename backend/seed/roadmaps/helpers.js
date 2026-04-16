/** Shared GFG/MDN-style resources and playlist helpers for seed roadmaps */

function gfg(path) {
    return `https://www.geeksforgeeks.org/${path}`;
}

function ytPlaylist(listId, title, channel) {
    return {
        playlist_title: title,
        playlist_url: `https://www.youtube.com/playlist?list=${listId}`,
        channel_name: channel,
        language: 'english',
        is_free: true,
    };
}

/** Curated free playlists (public YouTube list IDs) */
const PLAYLISTS = {
    nodeNetNinja: ytPlaylist(
        'PL4cUxeGkcC9jsz4NKYDUDAtRz0CcY88Aj',
        'Node.js Tutorial for Beginners',
        'The Net Ninja'
    ),
    pythonCorey: ytPlaylist(
        'PL-osiE80TeTskuzBbFAToULgV9vBc9vhC',
        'Python Tutorials',
        'Corey Schafer'
    ),
    mlSentdex: ytPlaylist(
        'PLQVvvaa0QuDf2zOWNfYAXR2WHwKMmcOfs',
        'Machine Learning with Python',
        'sentdex'
    ),
    figmaDesignCourse: ytPlaylist(
        'PL4IUedHUB7d09S9Sh61Rwzq6OeadUs7Oy',
        'Figma UI/UX Design Essentials',
        'DesignCourse'
    ),
    pmExponent: ytPlaylist(
        'PLYElD7eAnub30mSdBokZd7Oaq_fyKn70h',
        'Product Management & Strategy',
        'Exponent'
    ),
};

module.exports = { gfg, ytPlaylist, PLAYLISTS };
