# Personas & journeys

## Visitor / tourist / expat

1. Lands on nation or island from search  
2. Narrows to a place hub  
3. Opens a listing — calls WhatsApp, reads reviews, requests a booking  
4. Optionally browses vendor shop products  

## Field agent

1. Logs into portal as `field_agent`  
2. Selects island + place  
3. Registers business (name, summary, WhatsApp, categories)  
4. Listing appears on place hub (“just registered”)  

## Business owner

1. Finds listing (or is sent claim link)  
2. Submits free claim  
3. Admin approves → ownership  
4. Edits listing; optionally opens vendor shop  

## Platform admin

1. Approves/rejects claims  
2. Oversees inventory and bookings  
3. Configures future packages / commission (default 0%)  

## Journeys to protect in QA

- Claim → approve → owner sees listing  
- Field register → visible on place hub  
- Booking request on `service` / `rental` / `event` listing  
- Vendor products visible on public Shop tab  
