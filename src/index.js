(function(){

  //var interviewer_name = $("[data-key='Greenhouse.Olark.fullName']").data('value'); // Interviewer's Name (not sure if this is legit)
  //
  //var interviewer_name = $("#interviewer .name").text(); // interviewer's name
  //
  //var candidate_name = $('.sidebar .name').text(); // Candidate Full name
  //
  //var parts = window.location.pathname.split('/');
  //
  //var scorecard_id = parts[1] === 'scorecards' ? parts[2] : ''; // candidate id
  //
  //var candidate_email = $('.sidebar .email').text(); // candidate email address
  //
  //var question_name = $($('.notes > strong').filter(function () { return $(this).text().match(/\bquestion\b/i) })[0]).next().text(); // question name

  //var interviewer_name = 'Leland Richardson'; // interviewer's name
  //
  //var candidate_name = 'John Doe'; // Candidate Full name
  //
  //var candidate_id = '9817239812'; // candidate id
  //
  //var candidate_email = 'john.doe@example.com'; // candidate email address
  //
  //var question_name = 'Tabs Plugin'; // question name



  // from activity feed

  var interviewer_names = $('.author').map(function() { return $(this).text(); });

  var scorecard_ids = toArray($("#notes a")
    .filter(function() { return $(this).text() === "View Full Scorecard";})
    .map(function() { return $(this).attr('href'); }))
    .map(scorecardFromUrl);

  var question_names = toArray($("#notes .interview").map(questionNameFromNotes));

  var question_types = toArray($("#notes .title").map(function() { return $(this).text(); }))
    .map(parseQuestionType);

  var candidate_email = $(".contact-list.emails > li").first().find('a').text();

  var candidate_name = $(".person-name-and-headline-container h2").contents().first().text().trim();




  // hardcoded

  //var interviewer_names = [
  //  "Jessica Chastain",
  //  "Brad Pitt",
  //  "Aziz Ansari",
  //  "Tom Hanks",
  //  "Rachel McAdams",
  //  "Robert Downey"
  //];
  //
  //var scorecard_ids = ["2912335", "291234", "2925421", "2983245", "2916274", "2493213"];
  //
  //var question_names = ["", "FooBar", "", "Doo dad", "One in Many", "Merge Sort"];
  //
  //var question_types = ["CORE VALUES", "CODING INTERVIEW", "CORE VALUES", "CODING INTERVIEW", "CODING INTERVIEW", "TPS"];
  //
  //var candidate_email = "johndoe@johndoe.com";
  //
  //var candidate_name = "John Doe";
  //




  var ISTPS = !(question_types.some(function (qtype) {
    return qtype === 'CORE VALUES'; // if there is a CV interview, its an onsite
  }));

  var items = question_types
    .filter(function (qtype) {
      if (ISTPS) {
        return /TPS/.test(qtype); // only include TPS questions
      } else {
        return !(/TPS/.test(qtype)) && !(/RECRUITER/.test(qtype)); // include everything but TPS
      }
    })
    .map(function(qtype, i) {
      return {
        qtype: qtype,
        iname: interviewer_names[i],
        scid: scorecard_ids[i],
        qname: question_names[i],
      };
    });

  var TPS_TEMPLATE = 'Hey <%= candidate_fname %>,\n\n' +
    'I hope your phone call with <%= interviewer_fname %> went well. At Airbnb we really strive to ' +
    'make our interview process the best it can possibly be, and one of the ways we do that is we ' +
    'ask all candidates to fill out a survey about their interview experience.\n\n' +
    'This is completely optional and your responses do not factor into our decision-making process.\n\n' +
    'The link to the survey is:\n' +
    '<%= survey_url %>\n\n';

  var ONSITE_TEMPLATE = 'Hey <%= candidate_fname %>,\n\n' +
    'I hope your day of interviewing went well! At Airbnb we really strive to ' +
    'make our interview process the best it can possibly be, and one of the ways we do that is we ' +
    'ask all candidates to fill out a survey about their interview experience.\n\n' +
    'This is completely optional and your responses do not factor into our decision-making process.\n\n' +
    'The link to the survey is:\n' +
    '<%= survey_url %>\n\n';

  var TPS_SURVEY = 'airbnbengtps';

  var ONSITE_SURVEY = 'airbnbenginterview';

  var subject = 'Airbnb Candidate Survey';

  if (ISTPS) {
    // if its a TPS, we only want to include the latest one...
    items = items.slice(0,1);
  }

  // GETTING STARTED...

  function questionNameFromNotes() {
    return $(this).find('strong').filter(function () { return $(this).text().match(/\bquestion\b/i) }).first().next().text();
  }

  function parseQuestionType(question) {
    var index = question.indexOf('#');
    if (index === -1) {
      index = question.indexOf('-');
    }
    if (index === -1) {
      return question;
    } else {
      return question.slice(0, index).trim();
    }
  }

  function fname(name) {
    return (name || '').split(' ')[0];
  }

  function scorecardFromUrl(url) {
    return url.split('/')[2];
  }

  function toArray($els) {
    return [].slice.call($els, 0);
  }

  function toQueryString(obj) {
    return Object.keys(obj).map(function(key) {
      return key + '=' + encodeURIComponent(obj[key]);
    }).join('&');
  }

  (function run(cname, cemail, items, template, survey, subject) {

    var $container = $('<div />');
    var $modal = $('<div />').appendTo($container);

    var $form = $('' +
      '<form>' +
        '<label class="ab-label">Candidate Full Name:</label>' +
        '<input class="abjs-cname ab-input" type="text" />' +

        '<label class="ab-label">Candidate Email:</label>' +
        '<input class="abjs-cemail ab-input" type="text" />' +

        '<hr />' +

        (items.map(function (item, i) {
          return '' +
            '<div class="ab-question-' + i + '">' +
              '<div>' +
                '<div class="ab-half" style="padding-right: 10px;">' +
                  '<label class="ab-label">Interviewer Full Name:</label>' +
                  '<input class="abjs-iname ab-input" type="text" />' +
                '</div>' +
                '<div class="ab-half">' +
                  '<label class="ab-label">Question Name:</label>' +
                  '<input class="abjs-qname ab-input" type="text" />' +
                '</div>' +
              '</div>' +
              '<div>' +
                '<div class="ab-half" style="padding-right: 10px">' +
                  '<label class="ab-label">Scorecard ID #:</label>' +
                  '<input class="abjs-scid ab-input" type="text" />' +
                '</div>' +
                '<div class="ab-half">' +
                  '<label class="ab-label">Question Type:</label>' +
                  '<select class="abjs-qtype ab-select">' +
                    '<option></option>' +
                    '<option>TPS</option>' +
                    '<option>CODING INTERVIEW</option>' +
                    '<option>EXPERIENCE INTERVIEW</option>' +
                    '<option>FRONTEND INTERVIEW</option>' +
                    '<option>CORE VALUES</option>' +
                  '</select>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<hr />';

        }).join('\n')) +

        '<label class="ab-label">Email to Candidate:</label>' +
        '<textarea class="abjs-message ab-input"></textarea>' +

        '<button class="abjs-submit" type="button">' +
          'Generate Email' +
        '</button>' +
      '</form>'
    ).appendTo($modal);

    var $iname = $form.find('.abjs-iname');
    var $cname = $form.find('.abjs-cname');
    var $scid = $form.find('.abjs-scid');
    var $cemail = $form.find('.abjs-cemail');
    var $qname = $form.find('.abjs-qname');
    var $message = $form.find('.abjs-message');
    var $submit = $form.find('.abjs-submit');

    $container.css({
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      background: 'rgba(0,0,0,0.5)',
      overflowY: 'scroll',
    });

    $modal.css({
      border: '1px solid #000',
      position: 'absolute',
      top: 100,
      left: '50%',
      width: '500px',
      marginLeft: -250,
      background: '#fff',
      minHeight: 200,
      boxSizing: 'border-box',
      padding: 20,
      marginBottom: 100,
    });

    $form.find('.ab-input').css({
      display: 'block',
      width: '100%',
      boxSizing: 'border-box',
      marginBottom: 10,
      fontSize: '14px',
      padding: '4px 8px',
    });

    $form.find('.ab-select').css({
      display: 'block',
      width: '100%',
      boxSizing: 'border-box',
      marginBottom: 10,
      fontSize: '14px',
      padding: '4px 8px',
      border: '1px solid #CCC',
      background: '#fff',
      height: 28,
    });

    $form.find('.ab-label').css({
      fontSize: '10px',
      fontFamily: 'arial',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: '#999',
    });

    $form.find('.ab-half').css({
      width: '50%',
      boxSizing: 'border-box',
      display: 'inline-block',
    });

    $message.css({
      minHeight: 150
    });

    items.forEach(function(item, i) {
      var $q = $form.find('.ab-question-' + i);
      $q.find('.abjs-iname').val(item.iname);
      $q.find('.abjs-qname').val(item.qname);
      $q.find('.abjs-scid').val(item.scid);
      $q.find('.abjs-qtype').val(item.qtype);
    });

    $cname.val(cname);
    $cemail.val(cemail);

    $message.val(template);

    $('body').append($container);

    $submit.on('click', function () {

      var params = {
        cname: $cname.val(),
        cemail: $cemail.val(),
      };

      items.forEach(function (item, i) {
        var $q = $form.find('.ab-question-' + i);
        params['iname' + i] = $q.find('.abjs-iname').val();
        params['ifname' + i] = fname($q.find('.abjs-iname').val());
        params['qname' + i] = $q.find('.abjs-qname').val();
        params['scid' + i] = $q.find('.abjs-scid').val();
      });

      var surveyUrl = 'https://www.surveymonkey.com/r/' + survey +
        '?' + toQueryString(params);

      var messageBody = _.template($message.val())({
        candidate_name: $cname.val(),
        candidate_fname: fname($cname.val()),
        interviewer_name: $iname.first().val(),
        interviewer_fname: fname($iname.first().val()),
        question_name: $qname.first().val(),
        survey_url: surveyUrl
      });

      var mailToUrl='mailto:' +
        $cemail.val() +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(messageBody);

      window.open(mailToUrl);
      $container.remove();
    });

    $container.on('click', function(e) {
      if (e.target === this) {
        $container.remove();
      }
    });

    toArray($container.find('input, textarea')).some(function (el) {
      if (!$(el).val()) {
        $(el).focus();
        return true;
      } else {
        return false;
      }
    });

  }(
    candidate_name,
    candidate_email,
    items,
    ISTPS ? TPS_TEMPLATE : ONSITE_TEMPLATE,
    ISTPS ? TPS_SURVEY : ONSITE_SURVEY,
    subject
  ));
})();
