var axios = require('axios')
var fs = require('fs');




var getTicketFunc = function (nationalcode, doctorType) {
    var inputData = '';
    if (doctorType == 'surgeon')
        inputData = {
            'infirmary':
            {
                'title': 'درمانگاه جراحی',
                'code': '245',
                'coverImage': '',
                'hasBlog': true,
                'expertises': [],
                'id': 29
            },
            'doctors': [],
            'nationalCode': nationalcode
        };

    if (doctorType == 'dentist')
        inputData = {
            "infirmary":
            {
                "title": "دندانپزشکی",
                "code": "162",
                "coverImage": "",
                "hasBlog": false,
                "expertises": [],
                "id": 54
            },
            "doctors": [],
            'nationalCode': nationalcode
        }
    var patient;

    axios.get('https://miladhospital.com/api/patient/patient/GetOnlineReceptionPatientByNationalCode?nationalCode=' + nationalcode)
        .then(res => {
            patient = res.data;
            getNobatList(nationalcode, inputData, patient)
        }).catch(err => {
            console.error(err)
            return
        })


}

var getNobatList = function (nationalcode, inputData, patient) {

    axios.post('https://miladhospital.com/api/Timing/InfirmaryTiming/PostSearchInfirmaryTimingResult', inputData)
        .then(res => {
            if (res.status == 200 && !!res.data && res.data.length > 0) {
                var resData = res.data;
                resData = resData.sort(function (first, second) {
                    return new Date(first.date) - new Date(second.date);
                });

                var result;

                resData.some(element => {
                    element.infirmaryTimingShiftTimeResults.forEach(shift => {
                        if (shift.timingShiftType.id == 2) {
                            result = element;
                            return true;
                        };
                    });
                });

                result['patient'] = patient;
                result['infirmary'] = inputData['infirmary'];
                setTicket(result)
                fs.appendFile(nationalcode + Date.now() + ".txt", JSON.stringify(result), function (err) {
                    if (err) throw err;
                });
            }
        })
        .catch(error => {
            console.error(error)
        })
}

var setTicket = function (inputData) {
    var url = 'https://miladhospital.com/api/patient/patient/PostSetInfirmaryTimingOfPatient'
    console.log(" ---------------------------------- get ticket ----------------------------------");  
    axios.post(url, inputData)
        .then(res => {
            console.log('status code', res.status)
            if (res.status == 200 && res.data.result != null) {
                console.log('result', res.data)
                var resData = res.data;
                fs.appendFile(inputData.patient.nationalCode + '_ticket' + ".txt", JSON.stringify(resData), function (err) {
                    if (err) throw err;
                });
            } else {
                console.log(res.data.errorMessages)
            }
        })
        .catch(error => {
            console.error('Error ---------------------------', error)
            console.log(error.data.errorMessages)
        })

}





exports.getTicket = getTicketFunc;