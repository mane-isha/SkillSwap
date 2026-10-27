
import { useCallback, useEffect, useState } from 'react';
import './SessionWorkspace.css';

export default function SessionWorkspace({ request, direction, api }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [slots, setSlots] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reportReason, setReportReason] = useState('Other');
  const [reportDescription, setReportDescription] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [sessionData, setSessionData] = useState(request);

  const currentRequest = sessionData;
  const isProvider = direction === 'incoming';
  const status = currentRequest.status || 'Accepted';
  const booking = currentRequest.bookingStatus || 'Not scheduled';
  const format = currentRequest.sessionFormat || 'Undecided';
  const amount = Number(currentRequest.agreedAmount || 0);
  const payment =
    currentRequest.paymentStatus || (amount > 0 ? 'Pending' : 'Not required');

  const isActive = status === 'Accepted';
  const isOnHold = status === 'On hold';
  const isCompleted = status === 'Completed';
  const isCancelled = status === 'Cancelled';
  const proposedSlots = currentRequest.proposedSlots || [];
  const reports = currentRequest.reports || [];

  useEffect(() => {
    setSessionData(request);
  }, [request]);

  const loadMessages = useCallback(async (showSpinner = false) => {
    if (showSpinner) setChatLoading(true);

    try {
      const data = await api(`/requests/${request._id}/messages`);
      setMessages(Array.isArray(data) ? data : data.messages || []);
      setError('');
    } catch (e) {
      setError(e.message || 'Could not load messages.');
    } finally {
      if (showSpinner) setChatLoading(false);
    }
  }, [api, request._id]);

  const refreshRequest = useCallback(() => {
    window.dispatchEvent(new Event('skillswap:requests-refresh'));
  }, []);

  useEffect(() => {
    if (!isActive) {
      setMessages([]);
      return;
    }

    loadMessages(true);

    const timer = setInterval(() => {
      loadMessages(false);
    }, 3000);

    return () => clearInterval(timer);
  }, [isActive, loadMessages]);

  async function perform(action, extra = {}) {
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const result = await api(`/requests/${request._id}/session`, {
        method: 'PATCH',
        body: JSON.stringify({ action, ...extra }),
      });

      if (result.request) setSessionData(result.request);
      else if (result.data) setSessionData(result.data);

      setNotice(result.message || 'Session updated successfully.');
      refreshRequest();
    } catch (e) {
      setError(e.message || 'Could not update the session.');
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();

    const messageText = text.trim();
    if (!messageText || loading) return;

    setLoading(true);
    setError('');
    setNotice('');

    try {
      await api(`/requests/${request._id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: messageText }),
      });

      setText('');
      await loadMessages();
    } catch (e) {
      setError(e.message || 'Message could not be sent.');
    } finally {
      setLoading(false);
    }
  }

  async function proposeSlots(e) {
    e.preventDefault();

    const validSlots = slots.filter(Boolean).map(value => new Date(value));

    if (!validSlots.length) {
      setError('Choose at least one date and time.');
      return;
    }

    if (validSlots.some(date =>
      Number.isNaN(date.getTime()) || date <= new Date()
    )) {
      setError('All proposed times must be in the future.');
      return;
    }

    await perform('propose_slots', {
      slots: validSlots.map(date => date.toISOString()),
    });
  }

  async function submitReport(e) {
    e.preventDefault();

    if (!reportDescription.trim()) {
      setError('Please describe the issue.');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');

    try {
      const result = await api(`/requests/${request._id}/report`, {
        method: 'POST',
        body: JSON.stringify({
          reason: reportReason,
          description: reportDescription.trim(),
        }),
      });

      if (result.request) setSessionData(result.request);
      setNotice(result.message || 'Report submitted for review.');
      setShowReport(false);
      refreshRequest();
    } catch (e) {
      setError(e.message || 'Could not submit report.');
    } finally {
      setLoading(false);
    }
  }

  async function cancelRequest(e) {
    e.preventDefault();

    setLoading(true);
    setError('');
    setNotice('');

    try {
      const result = await api(`/requests/${request._id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: cancelReason.trim() }),
      });

      if (result.request) setSessionData(result.request);
      setNotice(result.message || 'Request cancelled.');
      setShowCancel(false);
      refreshRequest();
    } catch (e) {
      setError(e.message || 'Could not cancel request.');
    } finally {
      setLoading(false);
    }
  }

  async function completeSession() {
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const result = await api(`/requests/${request._id}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({}),
      });

      if (result.request) setSessionData(result.request);
      setNotice(result.message || 'Completion confirmation saved.');
      refreshRequest();
    } catch (e) {
      setError(e.message || 'Could not confirm completion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="sw-workspace">
      <div className="sw-workspace-heading">
        <div>
          <span className="sw-eyebrow">YOUR PRIVATE LEARNING SPACE</span>
          <h3>Session workspace</h3>
          <p>One conversation, two participants, a shared learning journey.</p>
        </div>

        {isActive && (
          <button
            type="button"
            className="sw-secondary"
            onClick={() => loadMessages(true)}
            disabled={chatLoading}
          >
            {chatLoading ? 'Refreshing…' : '↻ Refresh chat'}
          </button>
        )}
      </div>

      {error && <p className="sw-error" role="alert">{error}</p>}
      {notice && <p className="sw-success" role="status">{notice}</p>}

      <div className="sw-status-grid">
        <div><span>Request</span><strong>{status}</strong></div>
        <div><span>Booking</span><strong>{booking}</strong></div>
        <div><span>Format</span><strong>{format}</strong></div>
        <div>
          <span>Session fee</span>
          <strong>{amount > 0 ? `₹${amount}` : 'Free exchange'}</strong>
        </div>
        <div><span>Payment status</span><strong>{payment}</strong></div>
      </div>

      {isOnHold && (
        <div className="sw-notice">
          <h4>Session on hold</h4>
          <p>A report has been submitted. Please wait for review.</p>
        </div>
      )}

      {isCompleted && (
        <div className="sw-notice">
          <h4>Session completed</h4>
          <p>
            {currentRequest.completedAt
              ? new Date(currentRequest.completedAt).toLocaleString()
              : 'Completion has been recorded.'}
          </p>
        </div>
      )}

      {isCancelled && (
        <div className="sw-notice">
          <h4>Session cancelled</h4>
          <p>{currentRequest.cancellationReason || 'This request has been cancelled.'}</p>
          {payment === 'Refund pending' && (
            <p>A refund is pending review or processing; it has not been processed automatically.</p>
          )}
        </div>
      )}

      {isActive && (
        <>
          <div className="sw-section-heading">
            <div>
              <span className="sw-eyebrow">STAY CONNECTED</span>
              <h4>Private conversation</h4>
            </div>
            <span className="sw-live-indicator">● Auto-refresh · 3 sec</span>
          </div>

          <div className="sw-chat" aria-live="polite">
            {messages.length === 0 ? (
              <p className="sw-muted">
                {chatLoading ? 'Loading conversation…' : 'No messages yet. Say hello and get the conversation started!'}
              </p>
            ) : (
              messages.map((message, index) => (
                <div className="sw-message" key={message._id || index}>
                  <p>{message.text}</p>
                  <small>
                    {message.sender?.name ||
                      message.sender?.username ||
                      'Participant'}
                    {message.createdAt
                      ? ` · ${new Date(message.createdAt).toLocaleString()}`
                      : ''}
                  </small>
                </div>
              ))
            )}
          </div>

          <form className="sw-message-form" onSubmit={sendMessage}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write a message to your session partner…"
              maxLength={2000}
              required
            />
            <button disabled={loading || !text.trim()} type="submit">
              {loading ? 'Sending…' : 'Send ↗'}
            </button>
          </form>

          <div className="sw-divider" />

          <div className="sw-section-heading">
            <div>
              <span className="sw-eyebrow">LEARNING PREFERENCES</span>
              <h4>Choose your session format</h4>
            </div>
          </div>

          <div className="sw-format-grid">
            <button
              type="button"
              className={`sw-format-card ${format === 'Live' ? 'sw-format-selected' : ''}`}
              disabled={loading}
              onClick={() => perform('set_format', { format: 'Live' })}
            >
              <span className="sw-format-icon">◉</span>
              <strong>Live class</strong>
              <small>Learn together in real time</small>
              <span>{format === 'Live' ? '✓ Selected' : 'Choose live format ↗'}</span>
            </button>

            <button
              type="button"
              className={`sw-format-card ${format === 'Recorded' ? 'sw-format-selected' : ''}`}
              disabled={loading}
              onClick={() => perform('set_format', { format: 'Recorded' })}
            >
              <span className="sw-format-icon">▶</span>
              <strong>Recorded lesson</strong>
              <small>Learn from a prepared recording</small>
              <span>{format === 'Recorded' ? '✓ Selected' : 'Choose recorded format ↗'}</span>
            </button>
          </div>

          <div className="sw-divider" />

          <h4>Schedule your session</h4>

          {isProvider && (
            <form className="sw-slot-form" onSubmit={proposeSlots}>
              <p className="sw-muted">Suggest up to three future dates and times.</p>
              {slots.map((slot, index) => (
                <label key={index}>
                  Option {index + 1}
                  <input
                    type="datetime-local"
                    value={slot}
                    onChange={e =>
                      setSlots(old =>
                        old.map((value, i) => i === index ? e.target.value : value)
                      )
                    }
                  />
                </label>
              ))}
              <button type="submit" disabled={loading}>
                {loading ? 'Saving…' : 'Propose time slots'}
              </button>
            </form>
          )}

          {proposedSlots.length > 0 && (
            <div className="sw-proposed-slots">
              <p><strong>Available time slots</strong></p>
              {proposedSlots.map((slot, index) => (
                <div className="sw-slot" key={`${slot}-${index}`}>
                  <span>{new Date(slot).toLocaleString()}</span>
                  {!isProvider && booking !== 'Booked' && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => perform('book_slot', { slot })}
                    >
                      Select time
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {currentRequest.selectedSlot && (
            <div className="sw-selected-slot">
              <strong>Selected session time</strong>
              <p>{new Date(currentRequest.selectedSlot).toLocaleString()}</p>
              <p>Learner: {currentRequest.learnerConfirmed ? 'Confirmed' : 'Awaiting confirmation'}</p>
              <p>Provider: {currentRequest.providerConfirmed ? 'Confirmed' : 'Awaiting confirmation'}</p>

              {!(isProvider
                ? currentRequest.providerConfirmed
                : currentRequest.learnerConfirmed) && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => perform('confirm_booking')}
                >
                  Confirm this time
                </button>
              )}
            </div>
          )}

          {booking === 'Booked' && (
            <div className="sw-notice">
              <h4>Did your session take place?</h4>
              <p>Both participants must confirm before the session is marked completed.</p>
              <button type="button" disabled={loading} onClick={completeSession}>
                Confirm session completed
              </button>
            </div>
          )}

          {amount > 0 && (
            <>
              <div className="sw-divider" />
              <h4>Payment information</h4>
              <p className="sw-muted">
                Agreed fee: ₹{amount}. Status: {payment}.
              </p>
              <p className="sw-muted">
                Online payment verification is not connected yet. This status does not prove payment.
              </p>
            </>
          )}

          <div className="sw-divider" />
          <h4>Manage session</h4>

          <div className="sw-actions">
            <button
              type="button"
              className="sw-secondary"
              disabled={loading}
              onClick={() => {
                setShowCancel(value => !value);
                setShowReport(false);
              }}
            >
              Cancel session
            </button>
            <button
              type="button"
              className="sw-secondary"
              disabled={loading}
              onClick={() => {
                setShowReport(value => !value);
                setShowCancel(false);
              }}
            >
              Report a problem
            </button>
          </div>

          {showCancel && (
            <form className="sw-slot-form" onSubmit={cancelRequest}>
              <label>
                Reason for cancellation (optional)
                <textarea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Tell us why you need to cancel."
                />
              </label>
              <button type="submit" disabled={loading}>
                Confirm cancellation
              </button>
            </form>
          )}

          {showReport && (
            <form className="sw-slot-form" onSubmit={submitReport}>
              <label>
                Report reason
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                >
                  <option>Misconduct</option>
                  <option>Harassment</option>
                  <option>No-show</option>
                  <option>Payment issue</option>
                  <option>Misleading listing</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Describe the issue
                <textarea
                  value={reportDescription}
                  onChange={e => setReportDescription(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  required
                  placeholder="Explain what happened."
                />
              </label>
              <p className="sw-muted">
                Submitting a report places the request on hold while it is reviewed.
              </p>
              <button type="submit" disabled={loading}>
                Submit report
              </button>
            </form>
          )}
        </>
      )}

      {(isOnHold || isCompleted || isCancelled || status === 'Rejected') && (
        <div className="sw-report-history">
          <h4>Report history</h4>
          {reports.length === 0 ? (
            <p className="sw-muted">No report details available.</p>
          ) : (
            reports.map((report, index) => (
              <div className="sw-message" key={report._id || index}>
                <p><strong>{report.reason}</strong> · {report.status}</p>
                <p>{report.description}</p>
                {report.resolution && <p>Review outcome: {report.resolution}</p>}
                {report.createdAt && (
                  <small>{new Date(report.createdAt).toLocaleString()}</small>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
