import { db } from '@bids/db';
import { createRouter } from '../core/http/router';
import { jsonOk } from '../core/http/errors';
import { requireAuth } from '../core/auth/middleware';

const router = createRouter();

router.use('*', requireAuth);

// ── GET /dashboard ────────────────────────────────────────────────────────────
// Returns aggregated stats for the dashboard KPI cards and charts
router.get('/', async (c) => {
  const [
    requestStats,
    donorStats,
    recentRequests,
    urgencyBreakdown,
    bloodTypeStats,
    feedbackStats,
  ] = await Promise.all([
    // Request counts by status (v3 vocabulary)
    db(c)
      .prepare(
        `SELECT
           COUNT(*) as total,
           SUM(CASE WHEN status = 'in_progress'         THEN 1 ELSE 0 END) as in_progress,
           SUM(CASE WHEN status = 'managed'             THEN 1 ELSE 0 END) as managed,
           SUM(CASE WHEN status = 'managed_and_verified'THEN 1 ELSE 0 END) as managed_and_verified,
           SUM(CASE WHEN status = 'unmanaged'           THEN 1 ELSE 0 END) as unmanaged,
           SUM(CASE WHEN urgency = 'critical'           THEN 1 ELSE 0 END) as critical
         FROM blood_requests`
      )
      .first<{
        total: number;
        in_progress: number;
        managed: number;
        managed_and_verified: number;
        unmanaged: number;
        critical: number;
      }>(),

    // Donor counts by status (v3 vocabulary)
    db(c)
      .prepare(
        `SELECT
           COUNT(*) as total,
           SUM(CASE WHEN status = 'active'      THEN 1 ELSE 0 END) as active,
           SUM(CASE WHEN status = 'pledged'     THEN 1 ELSE 0 END) as pledged,
           SUM(CASE WHEN status = 'blacklisted' THEN 1 ELSE 0 END) as blacklisted
         FROM donors`
      )
      .first<{ total: number; active: number; pledged: number; blacklisted: number }>(),

    // Last 5 blood requests (newest first)
    db(c)
      .prepare(
        `SELECT id, patient_name, blood_type, urgency, status, hospital_name, requested_at
         FROM blood_requests ORDER BY requested_at DESC LIMIT 5`
      )
      .all<{
        id: string;
        patient_name: string;
        blood_type: string;
        urgency: string;
        status: string;
        hospital_name: string;
        requested_at: string;
      }>(),

    // Request count by urgency
    db(c)
      .prepare(
        `SELECT urgency, COUNT(*) as count FROM blood_requests GROUP BY urgency`
      )
      .all<{ urgency: string; count: number }>(),

    // Blood type demand (top requested blood types)
    db(c)
      .prepare(
        `SELECT blood_type, COUNT(*) as count FROM blood_requests GROUP BY blood_type ORDER BY count DESC`
      )
      .all<{ blood_type: string; count: number }>(),

    // Feedback stats
    db(c)
      .prepare(
        `SELECT
           COUNT(*) as total,
           SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
           ROUND(AVG(rating), 1) as avg_rating
         FROM feedback`
      )
      .first<{ total: number; new_count: number; avg_rating: number | null }>(),
  ]);

  return jsonOk(c, {
    requests: requestStats,
    donors: donorStats,
    recentRequests: recentRequests.results ?? [],
    urgencyBreakdown: urgencyBreakdown.results ?? [],
    bloodTypeStats: bloodTypeStats.results ?? [],
    feedback: feedbackStats,
  });
});

// ── GET /dashboard/reminders ──────────────────────────────────────────────────
// All pending (overdue) follow-up reminders — 1 hour after managed (BRR-007)
router.get('/reminders', async (c) => {
  const rows = await db(c)
    .prepare(
      `SELECT fr.*, br.patient_name, br.blood_type, br.hospital_name, br.status AS request_status
       FROM follow_up_reminders fr
       JOIN blood_requests br ON fr.request_id = br.id
       WHERE fr.resolved = 0 AND fr.due_at <= datetime('now')
       ORDER BY fr.due_at ASC`
    )
    .all<Record<string, unknown>>();

  return jsonOk(c, rows.results ?? []);
});

// ── GET /dashboard/reports ────────────────────────────────────────────────────
// Extended report data (monthly trends, blood type availability)
router.get('/reports', async (c) => {
  const [monthlyRequests, donorLocations, hospitalInventory] = await Promise.all([
    // Requests per month (last 6 months)
    db(c)
      .prepare(
        `SELECT
           strftime('%Y-%m', requested_at) as month,
           COUNT(*) as total,
           SUM(CASE WHEN status = 'managed' OR status = 'managed_and_verified' THEN 1 ELSE 0 END) as managed
         FROM blood_requests
         WHERE requested_at >= date('now', '-6 months')
         GROUP BY month
         ORDER BY month ASC`
      )
      .all<{ month: string; total: number; managed: number }>(),

    // Donor distribution by location (active donors only)
    db(c)
      .prepare(
        `SELECT location, COUNT(*) as count FROM donors WHERE status = 'active' GROUP BY location ORDER BY count DESC LIMIT 10`
      )
      .all<{ location: string; count: number }>(),

    // Total blood inventory across all hospitals
    db(c)
      .prepare(
        `SELECT blood_type, SUM(units) as total_units FROM hospital_inventory GROUP BY blood_type`
      )
      .all<{ blood_type: string; total_units: number }>(),
  ]);

  return jsonOk(c, {
    monthlyRequests: monthlyRequests.results ?? [],
    donorLocations: donorLocations.results ?? [],
    hospitalInventory: hospitalInventory.results ?? [],
  });
});

export default router;
