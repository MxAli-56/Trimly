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




6. Create Request

Method: POST

URL: http://localhost:5000/api/bookings/request

Headers: Authorization: Bearer <CUSTOMER_TOKEN>

Body:

json
{
  "barberProfileId": "YAHAN_BARBER_PROFILE_KI_ID_PASTE_KARO",
  "serviceIds": ["YAHAN_SERVICE_KI_ID_PASTE_KARO"],
  "date": "2026-11-15",
  "startTime": "10:00"
}
(Customer token seed script se testcustomer@trimly.com se login karke lo).

Expected Response:

json
{
  "success": true,
  "message": "Booking requested. Barber has 2 minutes to accept.",
  "data": {
    "bookingId": "...",
    "appointmentCode": "TRM-A1B2C3",
    "holdExpiresAt": "2026-11-15T...",
    "message": "..."
  }
}



7. Accept Booking (Barber)

Method: PATCH

URL: http://localhost:5000/api/bookings/<BOOKING_ID>/accept

Headers: Authorization: Bearer <BARBER_TOKEN>

Expected Output: 200 OK, Status ACCEPTED, aur naya holdExpiresAt (3 mins baad ka).

8. Reject Booking (Barber)

Method: PATCH

URL: http://localhost:5000/api/bookings/<BOOKING_ID>/reject

Headers: Authorization: Bearer <BARBER_TOKEN>

Body:

json
{
  "reason": "I am fully booked for this time."
}
Expected Output: 200 OK, Status REJECTED.

9. Pay Deposit (Customer)

Method: PATCH

URL: http://localhost:5000/api/bookings/<BOOKING_ID>/pay

Headers: Authorization: Bearer <CUSTOMER_TOKEN>

Expected Output: 200 OK, Status CONFIRMED.