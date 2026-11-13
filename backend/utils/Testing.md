1. POST /api/barber/schedule with Body (Bearer Token woh barber ka jo seed script se bana tha):

json:
{
  "dayOfWeek": "MONDAY",
  "startTime": "09:00",
  "endTime": "18:00",
  "breakStart": "13:00",
  "breakEnd": "14:00",
  "isWorkingDay": true
}


2. Toggle Availability

Method: PATCH

URL: http://localhost:5000/api/barber/availability

Headers: Authorization: Bearer <BARBER_TOKEN>

Body (Raw JSON):

json
{
  "isAvailable": true
}
Expected Response: { success: true, message: "Availability updated", data: { _id: "...", isAvailable: true } }

3. Add a Leave

Method: POST

URL: http://localhost:5000/api/barber/leaves

Headers: Authorization: Bearer <BARBER_TOKEN>

Body (Raw JSON):

json
{
  "leaveDate": "2026-11-15",
  "startTime": "14:00",
  "endTime": "16:00",
  "reason": "Doctor Appointment"
}
Expected Response: 201 Created

4. Get Leaves

Method: GET

URL: http://localhost:5000/api/barber/leaves

Headers: Authorization: Bearer <BARBER_TOKEN>

Expected Response: 200 OK with array of leaves.

5. Delete Leave

Method: DELETE

URL: http://localhost:5000/api/barber/leaves/<LEAVE_ID>

Headers: Authorization: Bearer <BARBER_TOKEN>

Expected Response: 200 OK