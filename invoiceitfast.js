var $invoiceNumber = $('[data-invoice-number]');
var $invoiceLineRow = $('[data-invoice-line]');
var $invoiceLineRowLineRate = $('[data-invoice-line-rate]');
var $invoiceLineRowLineQty = $('[data-invoice-line-qty]');
var $invoiceLineRowLineAmount = $('[data-invoice-line-amount]');
var $addInvoiceLine = $('#addInvoiceLine');
var $invoiceSubTotal = $('[data-invoice-subtotal]');
var $invoiceDiscount = $('[data-invoice-discount]');
var $invoiceTaxAmount= $('[data-invoice-taxAmount]');
var $invoiceTaxRate = $('[data-invoice-taxRate]');
var $invoiceTotal = $('[data-invoice-total]');
var $financeTaxPercent = $('[data-finance-taxPercent]');
var $financeDiscount = $('[data-finance-discount]');
var $invoiceNumber = $('[data-invoice-number]');
var $issueDate = $('#issueDate');
var $dueDate = $('#dueDate');
var $generateID = $('.generateID');
var overAllDecimalPoint = 2;




function printInvoice(){
  document.title = '@invoiceToPrintHeader';

  window.print();
}



$('#uploadButton').click(()=>{ 
  $('#imgupload').trigger('click'); 
});

function showMyImage(file){
  var type = file.files[0].type;
  if(type === 'image/png'){
    var url = URL.createObjectURL(file.files[0]);
    $('#pic').attr('src',url);
    $('#pic').draggable();
  }
}

$('#pic').on('dblclick',()=>{
  $('#pic').attr('src','-1');
});

$financeTaxPercent.on('keyup',(e)=>{
  var currentTaxPercent = $financeTaxPercent.text();
  var currentInvoiceSubTotal =  convertHTMLElementToDigitAndAddDecimalPoint($invoiceSubTotal,overAllDecimalPoint);
  var currentTaxPercent =  convertHTMLElementToDigitAndAddDecimalPoint($financeTaxPercent,overAllDecimalPoint);
  var currentDiscountPercent =  convertHTMLElementToDigitAndAddDecimalPoint($financeDiscount,overAllDecimalPoint);

  if(checkIfTargetIsANumber(currentTaxPercent)){
    $invoiceTaxRate.text(currentTaxPercent +' %')
    calculateTaxAmountWhenPercentAddedLater();
  }else{
    $invoiceTaxAmount.text('0.00');
    $invoiceTotal.text(getDigitWithDecimalPoint(currentInvoiceSubTotal,overAllDecimalPoint));
  }

  function calculateTaxAmountWhenPercentAddedLater(){
      var rate = currentTaxPercent / 100 + 1;
      var newTotal = rate * currentInvoiceSubTotal;
      var taxRateAmount = newTotal - currentInvoiceSubTotal;
      if(currentDiscountPercent > 0){
        var newDiscount = currentDiscountPercent / 100 * newTotal;
        newTotal = newTotal - newDiscount;
        $invoiceDiscount.text(getDigitWithDecimalPoint(newDiscount,overAllDecimalPoint));
      }

      $invoiceTaxAmount.text(getDigitWithDecimalPoint(taxRateAmount,overAllDecimalPoint));
      $invoiceTotal.text(getDigitWithDecimalPoint(newTotal,overAllDecimalPoint));
  }
})

$financeDiscount.on('keyup',(e)=>{
  var currentDiscountPercent = $financeDiscount.text();
  var taxRate = $invoiceTaxRate.text();
  var invoiceTotal = convertHTMLElementToDigitAndAddDecimalPoint($invoiceSubTotal,overAllDecimalPoint);
  var invoiceTaxAmount = convertHTMLElementToDigitAndAddDecimalPoint($invoiceTaxAmount,overAllDecimalPoint);
  
  if(checkIfTargetIsANumber(currentDiscountPercent) && taxRate === '0.00'){
    var discountAfterPercent = (currentDiscountPercent / 100) * invoiceTotal;
    var newTotal = invoiceTotal - discountAfterPercent;
    $invoiceDiscount.text(getDigitWithDecimalPoint(discountAfterPercent,overAllDecimalPoint));
    $invoiceTotal.text(getDigitWithDecimalPoint(newTotal,overAllDecimalPoint));
    
  }

  if(checkIfTargetIsANumber(currentDiscountPercent) && taxRate !== '0.00'){
    var currentInvoiceSubTotal =  convertHTMLElementToDigitAndAddDecimalPoint($invoiceSubTotal,overAllDecimalPoint);
    var currentTaxPercent =  convertHTMLElementToDigitAndAddDecimalPoint($financeTaxPercent,overAllDecimalPoint);
    var rate = currentTaxPercent / 100 + 1;
    var newTotal = rate * currentInvoiceSubTotal;
    var discountAfterPercent = (currentDiscountPercent / 100) * newTotal;
    var newTotal = newTotal - discountAfterPercent;
    $invoiceDiscount.text(getDigitWithDecimalPoint(discountAfterPercent,overAllDecimalPoint));
    $invoiceTotal.text(getDigitWithDecimalPoint(newTotal,overAllDecimalPoint));
  }

  if(currentDiscountPercent === ''){
    var currentInvoiceSubTotal =  convertHTMLElementToDigitAndAddDecimalPoint($invoiceSubTotal,overAllDecimalPoint);
    var currentTaxPercent =  convertHTMLElementToDigitAndAddDecimalPoint($financeTaxPercent,overAllDecimalPoint);
    var rate = currentTaxPercent / 100 + 1;
    var newTotal = rate * currentInvoiceSubTotal;
    $invoiceDiscount.text('0.00');
    $invoiceTotal.text(getDigitWithDecimalPoint(newTotal,overAllDecimalPoint));
  }
})

$addInvoiceLine.on('click',()=>{
  var invoiceLineRowLineAmount =  convertHTMLElementToDigitAndAddDecimalPoint($invoiceLineRowLineAmount,overAllDecimalPoint);
  if(invoiceLineRowLineAmount === 0){
    return alert('You can not add empty invoice lines');
  }

  id = ID();
  var $invoiceLineRow = $addInvoiceLine.parent();
  var newLineRow = $invoiceLineRow.clone();
  var $newInvoiceLineRow = newLineRow.insertAfter($invoiceLineRow);
  $newInvoiceLineRow.find('#deleteInvoiceLine').css('display','').attr('onclick','deleteRow("'+id+'")');
  $newInvoiceLineRow.attr('data-invoice-line',id)
  $newInvoiceLineRow.find('#addInvoiceLine').css('display','none');
  $newInvoiceLineRow.find('[data-invoice-line-qty]').removeAttr('contenteditable').css('background-color','');
  $newInvoiceLineRow.find('[data-invoice-line-rate]').removeAttr('contenteditable').css('background-color','');
  
  calculateSubTotalAdd();
  setRateQtyAndAmountToDefault();
  calculateTaxAmount();
  calculateDiscount();
  function calculateDiscount(){
    var currentDiscountPercent =  convertHTMLElementToDigitAndAddDecimalPoint($financeDiscount,overAllDecimalPoint);
    var currentInvoiceTotal =  convertHTMLElementToDigitAndAddDecimalPoint($invoiceTotal,overAllDecimalPoint);
  
    if(currentDiscountPercent != 0){
      var newTotalAfterDiscount = (currentDiscountPercent / 100) * currentInvoiceTotal;
      newTotalAfterDiscount = currentInvoiceTotal - newTotalAfterDiscount;
      var result = currentInvoiceTotal -newTotalAfterDiscount;
      $invoiceDiscount.text(getDigitWithDecimalPoint(result,overAllDecimalPoint));
      $invoiceTotal.text(getDigitWithDecimalPoint(newTotalAfterDiscount,overAllDecimalPoint));
    }
  }


});

function deleteRow(id){
  var $rowToBeDeleted = $('[data-invoice-line="'+id+'"]');
  calculateSubTotalSubtract($rowToBeDeleted);
  calculateTaxAmount();
  calculateDiscount();

  function calculateDiscount(){
    var currentDiscountPercent =  convertHTMLElementToDigitAndAddDecimalPoint($financeDiscount,overAllDecimalPoint);
    var currentInvoiceTotal =  convertHTMLElementToDigitAndAddDecimalPoint($invoiceTotal,overAllDecimalPoint);
  
    if(currentDiscountPercent != 0){
      var newTotalAfterDiscount = (currentDiscountPercent / 100) * currentInvoiceTotal;
      newTotalAfterDiscount = currentInvoiceTotal - newTotalAfterDiscount;
      var result = currentInvoiceTotal -newTotalAfterDiscount;
      $invoiceDiscount.text(getDigitWithDecimalPoint(result,overAllDecimalPoint));
      $invoiceTotal.text(getDigitWithDecimalPoint(newTotalAfterDiscount,overAllDecimalPoint));
    }
  }

  $rowToBeDeleted.fadeOut('slow',()=>{
    $(this).remove();
  });
}

function setRateQtyAndAmountToDefault(){
  $invoiceLineRowLineRate.text('')
  $invoiceLineRowLineQty.text('')
  $invoiceLineRowLineAmount.text('0.00')
}

$generateID.on('dblclick',()=>{
var id = ID();
$invoiceNumber.text(id);
});

function checkIfTargetIsANumber(target){
  var reg = new RegExp('^[0-9]+$');
  if(reg.test(target)){
    return true;
  }
  return false;
}

$('body').on('click', function(e){
  if($financeDiscount.text() === ''){
    $financeDiscount.text('0');
  }
  if($financeTaxPercent.text() === ''){
    $financeTaxPercent.text('0');
  }
});

$('body').on('click', '#issueDate, #dueDate', function(e){
  
  var currentObject = $(this).clone();
  var newInputDateObject = $(this).replaceWith('<input type="date" id="inIssueDate" />');
  
  $('#inIssueDate').on('change',function(){
    var currentSelectedDate = $(this).val();
    $(this).replaceWith(currentObject.text(currentSelectedDate));
  })
});

$($invoiceLineRowLineQty).keypress(function(e) {
  var x = e.charCode || e.keyCode;
  if (isNaN(String.fromCharCode(e.which)) && x!=46 || x===32 || x===13 || (x===46 && e.currentTarget.innerText.includes('.'))){
    e.preventDefault();
  } 
});
$($financeDiscount).keypress(function(e) {
  var x = e.charCode || e.keyCode;
  if (isNaN(String.fromCharCode(e.which)) && x!=46 || x===32 || x===13 || (x===46 && e.currentTarget.innerText.includes('.'))){
    e.preventDefault();
  } 
});
$($financeTaxPercent).keypress(function(e) {
  var x = e.charCode || e.keyCode;
  if (isNaN(String.fromCharCode(e.which)) && x!=46 || x===32 || x===13 || (x===46 && e.currentTarget.innerText.includes('.'))){
    e.preventDefault();
  } 
});
$($invoiceLineRowLineRate).keypress(function(e) {
  var x = e.charCode || e.keyCode;
  if (isNaN(String.fromCharCode(e.which)) && x!=46 || x===32 || x===13 || (x===46 && e.currentTarget.innerText.includes('.'))){
    e.preventDefault();
  }
});

function calculateInvoiceLineTotal(){
  
  var rate = convertHTMLElementToDigitAndAddDecimalPoint($invoiceLineRowLineRate,overAllDecimalPoint);
  var qty = convertHTMLElementToDigitAndAddDecimalPoint($invoiceLineRowLineQty,overAllDecimalPoint);
  var amount = rate * qty;
  amount = getDigitWithDecimalPoint(amount,overAllDecimalPoint);
  $invoiceLineRowLineAmount.text(amount);
  
  return parseFloat(amount);
};

function calculateDiscountWhenAddOrDeleteInvoiceLine(){
  var currentInvoiceSubTotal =  convertHTMLElementToDigitAndAddDecimalPoint($invoiceSubTotal,overAllDecimalPoint);
  var currentDiscountPercent =  convertHTMLElementToDigitAndAddDecimalPoint($financeDiscount,overAllDecimalPoint);

  if(currentDiscountPercent != 0){
    var newTotalAfterDiscount = (currentDiscountPercent / 100) * currentInvoiceSubTotal;
    newTotalAfterDiscount = currentInvoiceSubTotal - newTotalAfterDiscount;
    $invoiceTotal.text(getDigitWithDecimalPoint(newTotalAfterDiscount,overAllDecimalPoint));
  }
}

function calculateSubTotalAdd(){
  var currentInvoiceLineAmount =  convertHTMLElementToDigitAndAddDecimalPoint($invoiceLineRowLineAmount,overAllDecimalPoint);
  var currentInvoiceSubTotal =  convertHTMLElementToDigitAndAddDecimalPoint($invoiceSubTotal,overAllDecimalPoint);
  var newSubTotal =  currentInvoiceLineAmount + currentInvoiceSubTotal;
  newSubTotal = getDigitWithDecimalPoint(newSubTotal,overAllDecimalPoint);
  $invoiceSubTotal.text(newSubTotal);
  $invoiceTotal.text(newSubTotal);
  return parseFloat(newSubTotal);
}

function calculateSubTotalSubtract(rowToBeDeleted){
  var currentLineAmount = rowToBeDeleted.find('[data-invoice-line-amount]').text()
  currentLineAmount = convertStrToDigit(currentLineAmount,overAllDecimalPoint);
  currentInvoiceSubTotal = convertHTMLElementToDigitAndAddDecimalPoint($invoiceSubTotal,overAllDecimalPoint);
  newSubTotal = currentInvoiceSubTotal-currentLineAmount;
  newSubTotal = getDigitWithDecimalPoint(newSubTotal,overAllDecimalPoint);
  $invoiceSubTotal.text(newSubTotal);
  $invoiceTotal.text(newSubTotal);
  return parseFloat(newSubTotal);
}

$($invoiceLineRowLineRate).on('keyup',()=>{
  var invoiceLineTotal = calculateInvoiceLineTotal();
})

$($invoiceLineRowLineQty).on('keyup',()=>{
  var invoiceLineTotal = calculateInvoiceLineTotal();
})

function convertHTMLElementToDigitAndAddDecimalPoint($element, precision){
  var currentElement = $element;
  var currentInnerContent = +currentElement.text();
  var result = currentInnerContent.toFixed(precision);
  return parseFloat(result);
}

function convertStrToDigit(str,decimal){
  str = parseFloat(str);
  return str.toFixed(decimal);
}

function getDigitWithDecimalPoint(str, decimal){
  return str.toFixed(decimal);
}

var ID = function () {
  return Math.random().toString(36).substr(2, 9);
};

function calculateTaxAmount(){
  var currentInvoiceSubTotal =  convertHTMLElementToDigitAndAddDecimalPoint($invoiceSubTotal,overAllDecimalPoint);
  var currentTaxPercent =  convertHTMLElementToDigitAndAddDecimalPoint($financeTaxPercent,overAllDecimalPoint);
  var currentInvoiceTotal =  convertHTMLElementToDigitAndAddDecimalPoint($invoiceTotal,overAllDecimalPoint);
  var rate = currentTaxPercent / 100 + 1;
  var newTotal = rate * currentInvoiceSubTotal;
  var taxRateAmount = newTotal - currentInvoiceTotal;
  $invoiceTaxAmount.text(getDigitWithDecimalPoint(taxRateAmount,overAllDecimalPoint));
  $invoiceTotal.text(getDigitWithDecimalPoint(newTotal,overAllDecimalPoint));
}