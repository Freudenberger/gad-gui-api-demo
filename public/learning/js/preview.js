document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const courseId = parseInt(params.get("id"));
  const lessonId = parseInt(params.get("lesson")) || 0;

  if (!courseId) {
    window.location.href = "dashboard.html";
    return;
  }

  try {
    const course = await api.getCourseById(courseId);
    if (!course) throw new Error("Course not found");

    const courseHeader = document.getElementById("courseHeader");
    courseHeader.innerHTML = `
            <h1 aria-label="${course.title}" title="${course.title}" name="Course Title" id="courseTitle">${course.title}</h1>
            <div class="course-meta" aria-label="Course Information" title="Course Information">
                <span aria-label="Instructor" title="Instructor">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <a href="instructor-profile.html?id=${course.instructorId}" class="instructor-link">
                        ${course.instructor}
                    </a>
                </span>
                <span aria-label="Duration" title="Duration"><i class="fas fa-clock"></i> ${course.duration}</span>
                <span aria-label="Rating" title="Rating"><i class="fas fa-star"></i> ${course.rating}</span>
                <span aria-label="Level" title="Level"><i class="fas fa-signal"></i> ${course.level}</span>
                <span aria-label="Students Enrolled" title="Students Enrolled"><i class="fas fa-users"></i> ${course.students} student(s)</span>
            </div>
            <p class="course-description">${course.description}</p>
        `;

    const { previewLessons, totalLessons } = await api.getPreviewLessons(courseId);

    if (previewLessons.length === 0) {
      document.getElementById("previewContent").innerHTML = `
        <div class="preview-info">
          <h2>Course Preview</h2>
          <p>No preview lessons available for this course yet.</p>
        </div>`;
      return;
    }

    const currentLesson = lessonId < previewLessons.length ? previewLessons[lessonId] : previewLessons[0];
    const lessonContent = currentLesson ? await renderLessonContent(currentLesson) : "";

    const remainingLessons = Math.max(0, totalLessons - previewLessons.length);

    previewContent.innerHTML = `
            <div class="preview-info" aria-label="Course Preview Information" title="Course Preview Information">
                <h2>Course Preview</h2>
                <p>Get a taste of this course with these free preview lessons</p>
            </div>
            <div class="lessons-container">
                <div class="lessons-sidebar">
                    ${previewLessons
                      .map(
                        (lesson, index) => `
                        <div class="lesson-item ${lessonId === index ? "active" : ""}" 
                             onclick="window.location.href='preview.html?id=${courseId}&lesson=${index}'">
                            <div class="lesson-info">
                                <span class="lesson-title" aria-label="${lesson.title}" title="${lesson.title}">
                                    <i class="fas fa-${
                                      lesson.type === "video"
                                        ? "play-circle"
                                        : lesson.type === "reading"
                                        ? "book"
                                        : "question-circle"
                                    }"></i>
                                    ${lesson.title}
                                </span>
                                <span class="lesson-duration">
                                ${
                                  lesson.type === "quiz"
                                    ? `${lesson.content?.questions?.length} questions`
                                    : lesson.duration
                                }
                              </span>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                    ${
                      remainingLessons > 0
                        ? `
                    <div class="locked-content">
                        <h3><span style="color: #f44336;"><i class="fas fa-lock"></i></span> ${remainingLessons} More Lessons Available</h3>
                        <p>Sign in to access the full course content</p>
                        <div class="cta-buttons">
                            <a href="javascript:void(0)" class="primary-button" aria-label="Sign In" title="Sign In" onclick="redirectToCourseDetails(${courseId})">
                                Sign In
                            </a>
                            <a href="register.html" class="primary-button" aria-label="Create Account" title="Create Account">Create Account</a>
                        </div>
                    </div>
                    `
                        : ""
                    }
                </div>
                <div class="lesson-content-area" id="previewLessonContent" aria-label="Lesson Content">
                    ${lessonContent}
                </div>
            </div>
        `;

    window.addEventListener("message", (event) => {
      const iframe = document.querySelector("iframe.custom-video-player");
      if (iframe && event.source === iframe.contentWindow) {
        if (event.data.type === "ready") {
          iframe.contentWindow.postMessage(
            {
              type: "initialize",
              data: {
                duration: parseDuration(currentLesson.duration),
                durationStr: currentLesson.duration,
              },
            },
            "*"
          );
        }
      }
    });
  } catch (error) {
    console.error("Error loading preview:", error);
    document.getElementById("previewContent").innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load course preview. Please try again later.</p>
            </div>
        `;
  }
});

let messageHandler = null;

function parseDuration(timeStr) {
  // timeStr can be in the format "mm:ss" or "hh:mm:ss"
  const parts = timeStr.split(":");
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts.map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  } else {
    const [minutes, seconds] = timeStr.split(":").map(Number);
    return minutes * 60 + seconds;
  }
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

async function renderLessonContent(lesson) {
  if (messageHandler) {
    window.removeEventListener("message", messageHandler);
  }

  switch (lesson.type) {
    case "video":
      messageHandler = (event) => {
        const iframe = document.querySelector("iframe.custom-video-player");
        if (iframe && event.source === iframe.contentWindow) {
          if (event.data.type === "ready") {
            iframe.contentWindow.postMessage(
              {
                type: "initialize",
                data: {
                  duration: parseDuration(lesson.duration),
                  durationStr: lesson.duration,
                },
              },
              "*"
            );
          }
        }
      };

      window.addEventListener("message", messageHandler);

      return `
        <div class="lesson-content video-content">
          <iframe 
            src="/learning/video-player.html" 
            frameborder="0" 
            class="custom-video-player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            aria-label="Video Player"
            title="Video Player"
          ></iframe>
          <div class="video-time-display" style="display:none;">${lesson.duration}</div>
          <h3>${lesson.title}</h3>
          <div align="center">
            <a href="login.html" class="primary-button" aria-label="Sign In to track progress" title="Sign In to track progress">
              <i class="fas fa-lock"></i> Sign in to track progress
            </a>
          </div>
        </div>`;

    case "reading":
      return `
                <div class="lesson-content reading-content" name="${lesson.title}" aria-label="${lesson.title}">
                    <h3>${lesson.title}</h3>
                    <div class="content-text">
                        ${lesson.content.text}
                    </div>
                    <div class="resources">
                        <h4>Additional Resources:</h4>
                        <ul>
                            ${lesson.content.resources
                              .map((resource) => `<li><i class="fas fa-file-alt"></i> ${resource}</li>`)
                              .join("")}
                        </ul>
                    </div>
                </div>`;

    default:
      return `
                <div class="lesson-content" name="${lesson.title}" aria-label="${lesson.title}">
                    <h3>${lesson.title}</h3>
                    <p>Duration: ${lesson.duration}</p>
                    <div class="content-placeholder">
                        <p>Preview content not available for this lesson type.</p>
                    </div>
                </div>`;
  }
}

function redirectToCourseDetailsAuto() {
  const params = new URLSearchParams(window.location.search);
  const courseId = parseInt(params.get("id"));
  redirectToCourseDetails(courseId);
}

function redirectToCourseDetails(courseId) {
  if (isLoggedIn()) {
    window.location.href = `course-details.html?id=${courseId}`;
  } else {
    window.location.href = "login.html";
  }
}

function isLoggedIn() {
  // Implement your logic to check if the user is logged in
  return !!localStorage.getItem("authToken");
}
