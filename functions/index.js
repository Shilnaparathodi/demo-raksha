const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();
const db = admin.firestore();

// Priority assignment function
exports.assignPriority = functions.firestore
    .document('requests/{requestId}')
    .onCreate(async (snap, context) => {
        const request = snap.data();
        const description = (request.description || '').toLowerCase();
        const requestType = request.type || '';
        
        // Priority logic
        let priority = 3; // Default medium
        
        // Keywords for priority 5 (CRITICAL)
        if (description.includes('heart attack') || 
            description.includes('bleeding') || 
            description.includes('trapped') ||
            description.includes('unconscious') ||
            description.includes('fire') ||
            description.includes('collapse')) {
            priority = 5;
        }
        // Priority 4 (HIGH)
        else if (description.includes('medical') || 
                 description.includes('injured') ||
                 description.includes('hospital') ||
                 description.includes('ambulance') ||
                 requestType === 'medical' ||
                 description.includes('chest pain')) {
            priority = 4;
        }
        // Priority 2 (LOW)
        else if (description.includes('food') || 
                 description.includes('water') ||
                 requestType === 'food' ||
                 requestType === 'water') {
            priority = 2;
        }
        // Priority 1 (INFO)
        else if (description.includes('information') || 
                 description.includes('query') ||
                 description.includes('help')) {
            priority = 1;
        }
        
        // Update request with priority
        await snap.ref.update({ 
            priority,
            status: 'pending',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Decrement resources based on request type
        if (requestType === 'food' || requestType === 'water') {
            const resourceRef = db.collection('resources').doc(requestType);
            await resourceRef.update({
                quantity: admin.firestore.FieldValue.increment(-1)
            }).catch(() => {
                resourceRef.set({ quantity: 99 });
            });
        } else if (requestType === 'medical') {
            const resourceRef = db.collection('resources').doc('medicine');
            await resourceRef.update({
                quantity: admin.firestore.FieldValue.increment(-1)
            }).catch(() => {
                resourceRef.set({ quantity: 49 });
            });
        } else if (requestType === 'rescue') {
            const resourceRef = db.collection('resources').doc('boats');
            await resourceRef.update({
                quantity: admin.firestore.FieldValue.increment(-1)
            }).catch(() => {
                resourceRef.set({ quantity: 9 });
            });
        }
        
        return null;
    });

// GDACS data fetcher
exports.fetchGDACSAlerts = functions.pubsub
    .schedule('every 10 minutes')
    .onRun(async (context) => {
        try {
            const response = await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/ALL');
            const data = await response.json();
            
            const batch = db.batch();
            
            data.forEach(alert => {
                if (alert.lat && alert.lng) {
                    const alertRef = db.collection('alerts').doc();
                    batch.set(alertRef, {
                        type: alert.alerttype || 'Unknown',
                        country: alert.country || 'Unknown',
                        lat: alert.lat,
                        lng: alert.lng,
                        severity: alert.severity || 'Green',
                        eventId: alert.eventid || '',
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
            });
            
            await batch.commit();
            console.log(`Added ${data.length} GDACS alerts`);
        } catch (error) {
            console.error('Error fetching GDACS:', error);
        }
        
        return null;
    });

// SMS simulation
exports.simulateSMS = functions.https.onCall(async (data, context) => {
    const message = data.message || '';
    
    let type = 'food';
    let location = 'Unknown';
    let urgency = 3;
    let people = 1;
    let description = message;
    
    const typeMatch = message.match(/NEED\s+(\w+)/i);
    if (typeMatch) type = typeMatch[1].toLowerCase();
    
    const locationMatch = message.match(/AT\s+(\w+)/i);
    if (locationMatch) location = locationMatch[1];
    
    const urgencyMatch = message.match(/URGENCY\s+(\d)/i);
    if (urgencyMatch) urgency = parseInt(urgencyMatch[1]);
    
    const peopleMatch = message.match(/PEOPLE\s+(\d+)/i);
    if (peopleMatch) people = parseInt(peopleMatch[1]);
    
    const requestRef = await db.collection('requests').add({
        type,
        description,
        location,
        urgency,
        people,
        name: 'SMS User',
        source: 'sms',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending'
    });
    
    return { 
        success: true, 
        requestId: requestRef.id,
        parsed: { type, location, urgency, people }
    };
});
