document.addEventListener('DOMContentLoaded', function() {
    // Initialize Pannellum viewer
    const viewer = pannellum.viewer('panorama', {
        "type": "equirectangular",
        "panorama": "../images/panorama_sample.png",
        "autoLoad": true,
        "autoRotate": -2, // Slowly rotate to the left
        "compass": true,
        "showControls": true,
        "mouseZoom": true,
        "hfov": 110,
        "pitch": -10,
        "yaw": 0,
        "title": "阿爾卑斯山湖畔夕照",
        "author": "Smart Local Guide AI",
        "hotSpotDebug": false,
        "hotSpots": [
            {
                "pitch": -12,
                "yaw": 170,
                "type": "info",
                "text": "清澈的湖水反映著餘暉"
            },
            {
                "pitch": 10,
                "yaw": -20,
                "type": "info",
                "text": "壯麗的雪山巔峰"
            }
        ]
    });

    // Optional: Add custom interaction or event listeners
    viewer.on('load', function() {
        console.log('Panorama loaded successfully');
    });

    // Log errors if any
    viewer.on('error', function(err) {
        console.error('Pannellum error:', err);
    });
});
