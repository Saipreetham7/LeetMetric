document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('user-input');
  const searchBtn = document.getElementById('search-btn');
  const statsContainer = document.querySelector('.stats-container');
  const easyProgressCircle = document.querySelector('.easy-progress');
  const mediumProgressCircle = document.querySelector('.medium-progress');
  const hardProgressCircle = document.querySelector('.hard-progress');
  const easyLabel = document.querySelector('#easy-label');
  const mediumLabel = document.querySelector('#medium-label');
  const hardLabel = document.querySelector('#hard-label');
  const cardStatsContainer = document.querySelector('.stats-card');

  function validateUsername(username) {
    if (username.trim() === '') {
      alert('Username should not be empty');
      return false;
    }
    const regex = /^[a-zA-Z0-9_-]{1,15}$/;
    const isMatching = regex.test(username);
    if (!isMatching) {
      alert('Invalid Username');
    }
    return isMatching;
  }

  async function fetchUserDetails(username) {
    try {
      searchBtn.textContent = 'Searching...';
      searchBtn.disabled = true;

      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

      const url = `https://leetcode.com/graphql/`;
      const myHeaders = new Headers();
      myHeaders.append('content-type', 'application/json');

      const graphql = JSON.stringify({
        query: `query getUserProfile($username: String!) {
                    allQuestionsCount {
                        difficulty
                        count
                    }
                    matchedUser(username: $username) {
                        submitStats {
                            acSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                            totalSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                        }
                    }
                }`,
        variables: { username: `${username}` },
      });

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: graphql,
        redirect: 'follow',
      };

      const response = await fetch(proxyUrl + url, requestOptions);
      if (!response.ok) {
        throw new Error('Unable to fetch the User details');
      }
      const parsedData = await response.json();
      console.log('Logging Data: ', parsedData);

      displayUserData(parsedData);
    } catch (error) {
      statsContainer.innerHTML = `<p> No data Found</p>`;
      console.log(error);
    } finally {
      searchBtn.textContent = 'Search';
      searchBtn.disabled = false;
    }
  }

  function updateProgress(solved, total, label, circle) {
    const progressDegree = (solved / total) * 100;
    console.log();
    circle.style.setProperty('--progress-degree', `${progressDegree}%`);
    label.textContent = `${solved}/${total}`;
  }

  function displayUserData(parsedData) {
    const totalQuestions = parsedData.data.allQuestionsCount[0].count;
    const totalEasyQuestions = parsedData.data.allQuestionsCount[1].count;
    const totalMediumQuestions = parsedData.data.allQuestionsCount[2].count;
    const totalHardQuestions = parsedData.data.allQuestionsCount[3].count;

    const totalSolvedQuestions =
      parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
    const totalSolvedEasyQuestions =
      parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
    const totalSolvedMediumQuestions =
      parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
    const totalSolvedHardQuestions =
      parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

    updateProgress(
      totalSolvedEasyQuestions,
      totalEasyQuestions,
      easyLabel,
      easyProgressCircle
    );
    updateProgress(
      totalSolvedMediumQuestions,
      totalMediumQuestions,
      mediumLabel,
      mediumProgressCircle
    );
    updateProgress(
      totalSolvedHardQuestions,
      totalHardQuestions,
      hardLabel,
      hardProgressCircle
    );

    const cardsData = [
      {
        label: 'Overall Submissions',
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[0]
            .submissions,
      },
      {
        label: 'Overall Easy Submissions',
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[1]
            .submissions,
      },
      {
        label: 'Overall Medium Submissions',
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[2]
            .submissions,
      },
      {
        label: 'Overall Hard Submissions',
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[3]
            .submissions,
      },
    ];

    console.log(cardsData);

    cardStatsContainer.innerHTML = cardsData
      .map((data) => {
        return `
        <div class="card">
          <h3>${data.label}</h3>
          <p>${data.value}</p>
        </div>
      `;
      })
      .join('');
  }

  searchBtn.addEventListener('click', () => {
    const username = usernameInput.value;
    console.log(`Username is: ${username}`);
    if (validateUsername(username)) {
      fetchUserDetails(username);
    }
  });
});
