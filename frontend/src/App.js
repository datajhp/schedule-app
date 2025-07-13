import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';

function App() {
  const [events, setEvents] = useState([]);
  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleDateClick = (info) => {
    const date = info.dateStr;
    setSelectedDateTime(`${date}T00:00`);
    setTitle('');
    setType('');
    setSelectedEvent(null);
  };

  const handleEventClick = (info) => {
    const event = events.find((e) => e.id === info.event.id);
    setSelectedEvent(event);
    setTitle(event.title);
    setSelectedDateTime(event.dateTime);
    setType(event.type || '');
  };

  const handleAddOrUpdate = () => {
    if (!title || !type) return;

    if (selectedEvent) {
      const updatedEvents = events.map((e) =>
        e.id === selectedEvent.id
          ? { ...e, title, date: selectedDateTime, dateTime: selectedDateTime, type }
          : e
      );
      setEvents(updatedEvents);
    } else {
      const newEvent = {
        id: String(Date.now()),
        title,
        date: selectedDateTime.split('T')[0],
        dateTime: selectedDateTime,
        completed: false,
        type
      };
      setEvents([...events, newEvent]);
    }
    resetForm();
  };

  const handleDelete = () => {
    if (selectedEvent) {
      setEvents(events.filter((e) => e.id !== selectedEvent.id));
      resetForm();
    }
  };

  const handleToggleComplete = () => {
    if (selectedEvent) {
      const updatedEvents = events.map((e) =>
        e.id === selectedEvent.id ? { ...e, completed: !e.completed } : e
      );
      setEvents(updatedEvents);
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedEvent(null);
    setTitle('');
    setSelectedDateTime('');
    setType('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto bg-white shadow-lg p-4 overflow-visible">
        <h1 className="text-3xl font-bold text-center mb-4">📅 한국형 캘린더 (유형 선택, 요일 색, 완료 표시)</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* FullCalendar */}
          <div className="md:col-span-3">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              selectable={true}
              events={events.map((e) => ({
                ...e,
                start: e.dateTime,
                title: `[${e.type}] ${e.title}`
              }))}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height={500}
              timeZone="Asia/Seoul"
              locale={koLocale}
              dayHeaderDidMount={(arg) => {
                if (arg.el.cellIndex === 0) {
                  arg.el.style.color = 'red';
                }
                if (arg.el.cellIndex === 6) {
                  arg.el.style.color = 'blue';
                }
              }}
              dayCellDidMount={(arg) => {
                const dayNumberEl = arg.el.querySelector('.fc-daygrid-day-number');
                if (dayNumberEl) {
                  if (arg.el.cellIndex === 0) dayNumberEl.style.color = 'red';
                  if (arg.el.cellIndex === 6) dayNumberEl.style.color = 'blue';
                }
              }}
              eventDidMount={(arg) => {
                const event = events.find((e) => e.id === arg.event.id);
                if (event && event.completed) {
                  arg.el.style.backgroundColor = 'lightgreen';
                  arg.el.style.color = 'black';
                } else {
                  arg.el.style.backgroundColor = '';
                  arg.el.style.color = 'black';
                }
              }}
            />
          </div>

          {/* Form */}
          <div className="bg-gray-100 rounded-lg p-4 shadow-md">
            <h2 className="text-lg font-semibold mb-2 text-center">
              {selectedEvent ? '일정 수정' : '일정 추가'}
            </h2>

            <div className="space-y-2">
              <input
                type="text"
                value={title}
                placeholder="일정 제목"
                onChange={(e) => setTitle(e.target.value)}
                className="border rounded p-2 w-full"
              />
              <input
                type="datetime-local"
                value={selectedDateTime}
                onChange={(e) => setSelectedDateTime(e.target.value)}
                className="border rounded p-2 w-full"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border rounded p-2 w-full"
              >
                <option value="">유형 선택</option>
                <option value="개인">개인</option>
                <option value="업무">업무</option>
                <option value="기타">기타</option>
              </select>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleAddOrUpdate}
                  className="bg-blue-500 text-white rounded px-4 py-2 w-full"
                  disabled={!selectedDateTime || !title || !type}
                >
                  {selectedEvent ? '수정' : '추가'}
                </button>

                {selectedEvent && (
                  <>
                    <button
                      onClick={handleDelete}
                      className="bg-red-500 text-white rounded px-4 py-2 w-full"
                    >
                      삭제
                    </button>
                    <button
                      onClick={handleToggleComplete}
                      className="bg-green-500 text-white rounded px-4 py-2 w-full"
                    >
                      {selectedEvent.completed ? '완료 해제' : '완료 처리'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
