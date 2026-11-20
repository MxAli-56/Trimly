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




10. Create Off-Peak Booking (Customer)

Method: POST

URL: http://localhost:5000/api/bookings/off-peak

Headers: Authorization: Bearer <CUSTOMER_TOKEN>

Body:

json
{
  "barberProfileId": "BARBER_PROFILE_ID",
  "serviceIds": ["SERVICE_ID"],
  "date": "2026-11-15",
  "startTime": "14:00"
}
Expected Response: 201 Created. Check DB: Booking status PENDING_BARBER_APPROVAL, Payment collection mein ek record, aur isOffPeakBooking: true.

11. Barber Responds (Accept/Reject)

Method: PATCH

URL: http://localhost:5000/api/bookings/<BOOKING_ID>/off-peak-respond

Headers: Authorization: Bearer <BARBER_TOKEN>

Body (Reject):

json
{
  "action": "REJECT",
  "reason": "Sudden emergency, cannot make it."
}
Expected Response: 200 OK. Check DB: Booking status REJECTED, aur Refund collection mein ek record aa gaya for the deposit amount.



Reschedule APIs

Test 1: Working Hours Reschedule (Accept)

Customer booking request kare. Barber accept kare (Status: PENDING_CUSTOMER).

Barber PATCH /api/bookings/:id/barber-reschedule hit kare.

Body: {"newStartTime": "15:00", "newEndTime": "15:30"}

DB Status: PENDING_CUSTOMER_RESCHEDULE. Timer: 5 mins.

Customer PATCH /api/bookings/:id/respond-reschedule (action: ACCEPT) hit kare.

DB Status: PENDING_CUSTOMER. Timer: 3 mins. Time update ho jaye.



Test 2: Off-Peak Reschedule (Reject)

Customer off-peak booking kare aur pay kare (Status: PENDING_BARBER_APPROVAL).

Barber PATCH /barber-reschedule hit kare. DB Status: PENDING_CUSTOMER_RESCHEDULE.

Customer PATCH /respond-reschedule (action: REJECT) hit kare.

DB Status: CANCELLED. Refund collection mein entry ho.



Test 3: The Sweeper (Cron Job)

Reschedule request bhejo, aur 5 mins ka timer khatam hone do.

Check DB: Status automatically CANCELLED ho jayega.




Calendar View: (with token)

GET /api/barber/dashboard/timeline?date=2026-11-15

Response:
{
  "success": true,
  "data": {
    "date": "2026-11-15",
    "totalBookings": 4,
    "timeline": [
      { "time": "11:00", "status": "CONFIRMED", "customerName": "Hamza Malik", "services": "Skin Fade", "endTime": "11:45" },
      { "time": "11:45", "status": "AVAILABLE" },
      { "time": "12:30", "status": "CONFIRMED", "customerName": "Usman Sheikh", "services": "Haircut & Beard", "endTime": "13:15" },
      { "time": "14:00", "status": "ON_LEAVE" }
    ]
  }
}



Test 1: Start Service

Ek booking banao aur barber se accept karwao (CONFIRMED state).

Method: PATCH

URL: http://localhost:5000/api/bookings/<BOOKING_ID>/start

Headers: Authorization: Bearer <BARBER_TOKEN>

Expected: 200 OK, status: IN_PROGRESS

DB Check: Booking ka statusId IN_PROGRESS ka ObjectId ho.




Test 2: Complete Service (Loyalty Magic)

Wahi booking jo abhi start hui.

Method: PATCH

URL: http://localhost:5000/api/bookings/<BOOKING_ID>/complete

Headers: Authorization: Bearer <BARBER_TOKEN>

Expected: 200 OK, pointsAwarded: <calculated>

DB Check:

Booking COMPLETED status.

users collection mein customer ka loyaltyPoints barh gaya hoga.




Test 3: Safety Checks (The "Security" Tests)

Booking CONFIRMED hai, par directly /complete hit karo -> 400 error "must be IN_PROGRESS".

Booking barber A ki hai, par barber B ke token se /start hit karo -> 404 "Booking not found" (kyunke barberId match nahi karega).

Dobara /complete hit karo same booking pe -> 400 "must be IN_PROGRESS" (kyunke abhi COMPLETED hai, aur humara check sirf IN_PROGRESS allow karta hai).


Upcoming Bookings:

Method: GET
URL: http://localhost:5000/api/bar
ber/bookings/upcoming?page=1&limit=5

Headers: Authorization: Bearer <BARBER_TOKEN>

Expected Response:

json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "_id": "...",
        "appointmentCode": "TRM-XXXXXX",
        "customerId": {
          "name": "Hamza Malik",
          "profilePhoto": "...",
          "phone": "03001234567"
        },
        "bookingDate": "2026-11-16T00:00:00.000Z",
        "startTime": "11:00",
        "endTime": "11:45",
        "statusId": {
          "name": "CONFIRMED"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 5,
    "totalPages": 1
  }
}



A. Appointments Tab

1. Today's Appointments

Method: GET

URL: http://localhost:5000/api/barber/appointments/today

Headers: Authorization: Bearer <BARBER_TOKEN>

Expected Response:

json
{
  "success": true,
  "data": {
    "date": "2026-11-16",
    "total": 2,
    "appointments": [ { "_id": "...", "customerId": { "name": "..." }, "startTime": "10:00", "statusId": { "name": "CONFIRMED" } } ]
  }
}

2. Completed Bookings

Method: GET

URL: http://localhost:5000/api/barber/bookings/completed?page=1&limit=5

Headers: Authorization: Bearer <BARBER_TOKEN>

Expected Response: (Paginated list of COMPLETED bookings, similar to upcoming).



B. Profile Tab

3. Get My Profile

Method: GET

URL: http://localhost:5000/api/barber/profile

Headers: Authorization: Bearer <BARBER_TOKEN>

Expected Response:

json
{
  "success": true,
  "data": {
    "_id": "barber_profile_id",
    "userId": { "name": "Ali Barber", "email": "testbarber@trimly.com" },
    "bio": "Professional barber with modern styling experience",
    "specialties": ["Haircut", "Beard Trim"],
    "isAvailable": true,
    "avgRating": 4.7
  }
}


4. Update My Profile

Method: PUT

URL: http://localhost:5000/api/barber/profile

Headers: Authorization: Bearer <BARBER_TOKEN>

Body (JSON):

json
{
  "bio": "I specialize in skin fades and hot towel shaves.",
  "specialties": ["Skin Fade", "Beard Sculpting", "Hot Towel Shave"]
}
Expected Response: 200 OK, message: "Profile updated"



C. Service Operations 

5. Start Service

Method: PATCH

URL: http://localhost:5000/api/bookings/<BOOKING_ID>/start

Headers: Authorization: Bearer <BARBER_TOKEN>

Expected Response: 200 OK, message: "Service started successfully."




6. Complete Service

Method: PATCH

URL: http://localhost:5000/api/bookings/<BOOKING_ID>/complete

Headers: Authorization: Bearer <BARBER_TOKEN>

Expected Response: 200 OK, message: "Service completed. Customer earned X loyalty points."




----- Reviews & Ratings -----

Test 1: Submit a Review (Positive)

Pre-condition: Ek booking banao, barber se accept karwao, phir start karo, phir complete karo (/complete API).

Method: POST

URL: http://localhost:5000/api/reviews

Headers: Authorization: Bearer <CUSTOMER_TOKEN>

Body:

json
{
  "bookingId": "YAHAN_COMPLETED_BOOKING_ID",
  "rating": 5,
  "comment": "Best skin fade in town!"
}
Expected: 201 Created.

DB Check: Review collection mein data aya, aur BarberProfile mein avgRating update hua (e.g., 4.5 -> 4.6) aur ratingCount barha.

Test 2: Security - Duplicate Review

Method: POST

URL: http://localhost:5000/api/reviews

Body: Wahi bookingId jo upar use kiya.

Expected: 409 Conflict -> "You have already reviewed this booking".

Test 3: Security - Invalid Booking

Method: POST

URL: http://localhost:5000/api/reviews

Body: Random bookingId daal do ya aisi booking jo CONFIRMED hai (complete nahi hui).

Expected: 400 Bad Request -> "Booking not found, not completed, or doesn't belong to you".

Test 4: Get Barber Reviews (Positive)

Method: GET

URL: http://localhost:5000/api/reviews/barber?page=1&limit=5

Headers: Authorization: Bearer <BARBER_TOKEN>

Expected: 200 OK with reviews array and stats object.


------No Show, Risk------

Test 1: No-Show Flow

Booking banao aur Confirm karwao.

Method: PATCH

URL: http://localhost:5000/api/bookings/<BOOKING_ID>/no-show

Headers: Authorization: Bearer <BARBER_TOKEN>

Expected: 200 OK. Check DB: statusId NO_SHOW ka ObjectId ho.



Test 2: Risk Score Generation

Ek customer ka account lo jisne abhi No-Show kiya hai (Test 1).

Method: GET

URL: http://localhost:5000/api/barber/appointments/today

Expected Response: Booking ke andar riskScore field aaye (e.g., "riskScore": 50).

Ab us customer ko seed script se loyaltyPoints (e.g., 400) de do DB mein. Phir wapas API hit karo. Risk Score 50 se ghatega (400 points = 20 discount, Final = 30).


Test 3: Late Cancel

Booking banao aisi jo 1 ghante se kam time mein hai.

Customer se /cancel endpoint hit karwao.

DB mein check karo: cancelReason mein "LATE_CANCEL: ..." likha hoga.

Barber appointments/today call karega toh Risk Score automatically barha hua aayega.




-----Barber Schedule Update and Approve------

1. Barber Sends Request

Method: POST

URL: http://localhost:5000/api/barber/schedule/send-request

Body: { "schedule": [...] }


2. Barber Views Requests

Method: GET

URL: http://localhost:5000/api/barber/schedule/my-requests


3. Owner Approves/Rejects Request

Method: PATCH

URL: http://localhost:5000/api/owner/schedule/approve-request/<REQUEST_ID>

Body: { "approvedDays": ["MONDAY"], "rejectedDays": ["TUESDAY"] }



Test 1: Add Barber

Method: POST

URL: http://localhost:5000/api/owner/barbers/add

Headers: Authorization: Bearer <OWNER_TOKEN>

Body:

json
{
  "phoneNumber": "03001111111"
}
(Note: Yeh barber1@trimly.com ka phone hai jo seed script se aaya tha).

Test 2: Remove Barber

Method: PATCH

URL: http://localhost:5000/api/owner/barbers/<BARBER_PROFILE_ID>/remove

Headers: Authorization: Bearer <OWNER_TOKEN>

Body:

json
{
  "reason": "Moved to another city"
}