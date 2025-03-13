function renderLoadingState() {
  const progressGrid = document.querySelector(".progress-grid");
  progressGrid.innerHTML = `
        <div class="stats-container">
            ${Array(4)
              .fill()
              .map(
                () => `
                <div class="stat-card skeleton">
                    <div class="skeleton-circle"></div>
                    <div class="skeleton-text short" style="margin-top: 15px;"></div>
                    <div class="skeleton-text title" style="margin-top: 10px;"></div>
                </div>
            `
              )
              .join("")}
        </div>

        <div class="section-header skeleton-text title" style="width: 200px; margin: 30px 0 20px;"></div>
        
        <div class="course-progress-list">
            ${Array(3)
              .fill()
              .map(
                () => `
                <div class="course-progress-item skeleton">
                    <div class="course-progress-header">
                        <div class="skeleton-text title" style="width: 60%;"></div>
                        <div class="skeleton-text short" style="width: 50px;"></div>
                    </div>
                    <div class="progress-bar skeleton" style="margin: 15px 0;">
                        <div class="skeleton-text"></div>
                    </div>
                    <div class="course-progress-details">
                        <div class="skeleton-text short" style="width: 30%;"></div>
                        <div class="skeleton-text short" style="width: 25%;"></div>
                    </div>
                </div>
            `
              )
              .join("")}
        </div>
    `;
}

async function renderLearningProgress() {
  const progressGrid = document.querySelector(".progress-grid");
  renderLoadingState();

  try {
    const stats = await api.calculateLearningProgress();
    const enrolledCourses = await api.getEnrolledCourses();

    const statsHTML = `
            <div class="stats-container">
                <div class="stat-card">
                    <i class="fas fa-book fa-2x"></i>
                    <div class="stat-number completed-courses">${stats.completedCourses}/${stats.totalCourses}</div>
                    <p>Courses Completed</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-tasks fa-2x"></i>
                    <div class="stat-number average-progress">${stats.averageProgress}%</div>
                    <p>Overall Progress</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-clock fa-2x"></i>
                    <div class="stat-number completed-hours">${Math.round(stats.completedHours)}</div>
                    <p>Hours of Learning</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-graduation-cap fa-2x"></i>
                    <div class="stat-number completed-lessons">${stats.completedLessons}</div>
                    <p>Lessons Completed</p>
                </div>
            </div>

            <h3>Course Progress</h3>
            <div class="course-progress-list">
                ${
                  enrolledCourses.length === 0
                    ? `
                    <div class="empty-state">
                        <i class="fas fa-books fa-3x"></i>
                        <h3>No Courses Yet</h3>
                        <p>You haven't enrolled in any courses yet.</p>
                        <a href="/learning/dashboard.html" class="primary-button">Browse Courses</a>
                    </div>
                    `
                    : enrolledCourses
                        .map(
                          (enrollment) => `
                          <div class="course-progress-item">
                              <div class="course-progress-header">
                                  <h4>${enrollment.title}</h4>
                                  <span>${enrollment.progress}%</span>
                              </div>
                              <div class="progress-bar">
                                  <div class="progress" style="width: ${enrollment.progress}%"></div>
                              </div>
                              <div class="course-progress-footer">
                                  <div>
                                      <span>${enrollment.completed ? "Completed" : "In Progress"}</span>
                                      <span>Last accessed: ${new Date(
                                        enrollment.lastAccessed
                                      ).toLocaleDateString()}</span>
                                  </div>
                                  <button class="primary-button-small" onclick="window.location.href='/learning/course-viewer.html?id=${
                                    enrollment.courseId
                                  }'">
                                      <i class="fas fa-arrow-right"></i> Visit
                                  </button>
                              </div>
                          </div>
                      `
                        )
                        .join("")
                }
            </div>
        `;

    progressGrid.innerHTML = statsHTML;
  } catch (error) {
    console.error("Failed to load progress:", error);
    progressGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load progress data. Please try again later.</p>
            </div>
        `;
  }
}

document.addEventListener("DOMContentLoaded", renderLearningProgress);
