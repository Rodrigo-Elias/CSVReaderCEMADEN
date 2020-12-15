'use strict'

function processFile() {
    let fileSize = 0;
    //get file
    let theFile = document.getElementById("myFile");

    let regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
    //check if file is CSV
    if (regex.test(theFile.value.toLowerCase())) {
        //check if browser support FileReader
        if (typeof (FileReader) != "undefined") {
            //get table element
            let table = document.getElementById("myTable");
            let headerLine = "";
            //create html5 file reader object
            let myReader = new FileReader();
            // call filereader. onload function
            myReader.onload = function (e) {
                let content = myReader.result;
                //split csv file using "\n" for new line ( each row)
                let lines = content.split("\n");
                //loop all rows
                for (let count = 0; count < lines.length; count++) {
                    //create a tr element
                    let row = document.createElement("tr");
                    //split each row content
                    let rowContent = lines[count].split(";");
                    //loop throw all columns of a row
                    for (let i = 0; i < rowContent.length; i++) {
                        //create td element 
                        let cellElement = document.createElement("td");
                        if (count == 0) {
                            cellElement = document.createElement("th");
                            if (i == 6) {
                                rowContent.splice(6, 1, "data", "hora");
                                cellElement = document.createElement("th");
                            };
                        } else {
                            if (i == 6) {
                                let splitDateTime = rowContent[6].split(" ");
                                rowContent.splice(6, 1, splitDateTime[0], splitDateTime[1]);
                                cellElement = document.createElement("td");
                            }
                            if (i == 8) {
                                rowContent[8] = rowContent[8].replace(",", ".");
                            }
                            cellElement = document.createElement("td");
                        }
                        //add a row element as a node for table
                        let cellContent = document.createTextNode(rowContent[i]);

                        cellElement.appendChild(cellContent);
                        //append row child
                        row.appendChild(cellElement);
                    }
                    //append table contents
                    myTable.appendChild(row);
                }
            }
            //call file reader onload
            myReader.readAsText(theFile.files[0]);
        }
        else {
            alert("This browser does not support HTML5.");
        }

    }
    else {
        alert("Please upload a valid CSV file.");
    }
    return false;
}


function searchFilter() {
    //Get the Inputs
    let stationInput, dataInput;
    stationInput = document.getElementById("stationInput");
    dataInput = document.getElementById("dataInput");


    //Search Filters
    let stationFilter, dataFilter;
    stationFilter = stationInput.value.toUpperCase();
    dataFilter = dataInput.value

    //Table control variables.
    let table, tableRow, tableDataStation, tableDataDay, txtValueStation, txtValueDay;
    table = document.getElementById("myTable");
    tableRow = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (let i = 0; i < tableRow.length; i++) {

        tableDataStation = tableRow[i].getElementsByTagName("td")[3]; // busca por estação
        tableDataDay = tableRow[i].getElementsByTagName("td")[6]; // busca por data

        if (tableDataStation) {
            //getting the strings inside the cells
            txtValueStation = tableDataStation.textContent || tableDataStation.innerText;
            txtValueDay = tableDataDay.textContent || tableDataDay.innerText;

            //checking with the filter, set display to none if dont match.
            if (txtValueStation.toUpperCase().indexOf(stationFilter) > -1 &&
                txtValueDay.toUpperCase().indexOf(dataFilter) > -1) {
                tableRow[i].style.display = "";
            } else {
                tableRow[i].style.display = "none";
            }
        }
    }
    //Function to get the last column and sum all the visible numbers there, and place on spam tag.
    getSumWithFilters();
}

function getSumWithFilters() {
    //getting table and table row info
    let table = document.getElementById('myTable');
    let tr = table.getElementsByTagName('tr');

    //Some quick variables for the sum.
    let tableData, myInfo;
    let sumValue = 0.0;

    //grab all the numbers on column 8 at each row and add them together.
    for (let i = 0; i < tr.length; i++) {
        //at each loop get the eight cell.
        tableData = tr[i].getElementsByTagName("td")[8];

        //if true, add them together as long they are not hidden.
        if (tableData) {
            myInfo = tableData.textContent || tableData.innerText;
            if (tr[i].style.display === "") {
                sumValue += parseFloat(myInfo);
            }
        }
    }
    document.getElementById('sum').innerHTML = `Valor Acumulado total em amostra: ${sumValue.toFixed(2)}`
}


function getResultData() {
    //getting table and table row info
    let table = document.getElementById('myTable');
    let tr = table.getElementsByTagName('tr');


    let tableDataStation, tableDataDay, valueCell;
    let stationName, stationDay, value;
    let dataArray = [];

    for (let i = 1; i < tr.length; i++) {
        //at each loop get the name of the station.
        tableDataStation = tr[i].getElementsByTagName("td")[1];
        tableDataDay = tr[i].getElementsByTagName("td")[6];
        valueCell = tr[i].getElementsByTagName("td")[8];

        if (tableDataStation) {
            stationName = tableDataStation.textContent || tableDataStation.innerText;
            stationDay = tableDataDay.textContent || tableDataDay.innerText;
            value = valueCell.textContent || valueCell.innerText;
            dataArray.push([stationName, stationDay, value]);
        }
        if (!tableDataStation) {
            makeResultTable(dataArray)
        }
    }

}


function makeResultTable(dataArray) {

    let stationAndDateString, validationString;
    let sumValue = 0.0;
    let year = parseInt(dataArray[0][1].slice(0, 4));
    let month = parseInt(dataArray[0][1].slice(5, 7));
    let days = daysInMonth(month, year);
    //console.log('the year is: ' + year + 'and month ' + month + ' it has ' + days);

    //making the rest of the result Table according with numbers of days in month.
    let table = document.getElementById('resultDataTable');
    for (let i = 1; i <= days; i++) {
        let row = table.insertRow(i + 2);
        for (let j = 0; j < 9; j++) {
            let cell = row.insertCell(j);
            if (j === 0) {
                let day = i.toString();
                if (day.length < 2) {
                    day = '0' + day;
                }
                month = month.toString();
                if (month.length < 2) { //0.3_________________ 
                    console.log(month);
                    month = '0' + month;
                }
                cell.innerHTML = `${year}-${month}-${day}`
            } else {
                cell.innerHTML = 'none';
            }
        }
    }

    // getting all the value for each day in each station, and sending to another function to insert.
    for (let i = 0; i < dataArray.length; i++) {

        stationAndDateString = dataArray[i][0] + dataArray[i][1];
        //console.log(stationAndDateString);
        if (i == 0) {
            validationString = stationAndDateString;
            //console.log('primeira validation = ' + validationString)
        }
        if (stationAndDateString === validationString) {
            if (i === dataArray.length - 1) {
                validationString = dataArray[i][0] + dataArray[i][1];
            } else {
                validationString = dataArray[i + 1][0] + dataArray[i + 1][1];
            }
            sumValue += parseFloat(dataArray[i][2]);
        }
        if (stationAndDateString !== validationString) {
            //console.log(dataArray[i]);
            //console.log(sumValue.toFixed(2));
            insertValueOnResultTable(dataArray[i], sumValue.toFixed(2), days);
            sumValue = 0;
        }
        if (i === dataArray.length - 1) {
            //console.log(dataArray[i]);
            //console.log(sumValue.toFixed(2));
            insertValueOnResultTable(dataArray[i], sumValue.toFixed(2), days);
            sumValue = 0;
        }
    }

    //making the month Total row and adding all the days with the info inserted.
    let finalRow = table.insertRow(days + 3);
    for (let j = 0; j < 9; j++) {
        let tr = table.getElementsByTagName('tr');
        let cell = finalRow.insertCell(j);
        if (j === 0) {
            cell.innerHTML = 'Total'
        } else {
            cell.innerHTML = monthTotal(j)
        }
    }

    //making the table now visible to the user.
    let myDiv = document.getElementById('resultSection');
    myDiv.style.display = 'block';

}


function insertValueOnResultTable(array, num, days) {
    let table = document.getElementById('resultDataTable');
    let tr = table.getElementsByTagName('tr');

    let station = array[0];
    let date = array[1];
    let value = num;
    let i, j;


    for (i = 0; i < 9; i++) {
        let y, x;
        let cellElementX = tr[0].getElementsByTagName("td")[i].textContent || tr[0].getElementsByTagName("td")[i].innerHTML;
        if (cellElementX === station) {
            //console.log(`found ${cellElementX}`);
            x = i;
            for (j = 1; j <= days; j++) { //TODO Por aqui teve problemas na run da iza no trabalho.

                let cellElementY = tr[j + 2].getElementsByTagName("td")[0].textContent || tr[j + 2].getElementsByTagName("td")[0].innerHTML;

                if (cellElementY === date) {
                    y = j;
                    let cellElementResult = tr[y + 2].getElementsByTagName('td')[x]
                    cellElementResult.innerHTML = value;
                }
            }
        }
    }
}

function monthTotal(tableColumn){
    let table = document.getElementById('resultDataTable');
    let tr = table.getElementsByTagName("tr");
    let sumValue = 0;

    for (let i = 3; i < tr.length-1; i++) {
        //at each loop get the relative table column
        let tableData = tr[i].getElementsByTagName("td")[tableColumn].innerHTML;
        if (tableData != 'none'){
            sumValue += parseFloat(tableData);
        }
    }

    return sumValue.toFixed(2)
}

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

//export code from CodexWorlds for simplicity, softly modified for ES6
function exportTableToExcel(tableID, filename = ''){
    let downloadLink;
    let dataType = 'application/vnd.ms-excel';
    let tableSelect = document.getElementById(tableID);
    let tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
    
    // Specify file name
    filename = filename?filename+'.xls':'excel_data.xls';
    
    // Create download link element
    downloadLink = document.createElement("a");
    
    document.body.appendChild(downloadLink);
    
    if(navigator.msSaveOrOpenBlob){
        let blob = new Blob(['\ufeff', tableHTML], {
            type: dataType
        });
        navigator.msSaveOrOpenBlob( blob, filename);
    }else{
        // Create a link to the file
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
    
        // Setting the file name
        downloadLink.download = filename;
        
        //triggering the function
        downloadLink.click();
    }
}

