// ==UserScript==
// @name         CodePen TOC Generator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Generates TOC for Markdown posts in CodePen
// @author       jorgecardoso
// @match        https://codepen.io/write/*
// @grant        none
// @updateURL https://openuserjs.org/meta/jorgecardoso/CodePen_TOC_Generator.meta.js
// ==/UserScript==

(function() {
    'use strict';

    var toolbar = document.querySelector("#write div.editor-toolbar");

    var icon = document.createElement("a");
    icon.setAttribute("title", "Generate TOC");
    icon.setAttribute("class", "toolbar-btn");
    icon.innerHTML="TOC";
    toolbar.appendChild(icon);

    var textarea =document.createElement("textarea");
    textarea.setAttribute("style", "display:none");
    textarea.setAttribute("value", "jorge");
    textarea.setAttribute("id", "jorge");
    document.body.appendChild(textarea);

    var editor = document.querySelector(".CodeMirror").CodeMirror;

    console.log(editor);
    icon.addEventListener("click", function() {
        console.log("TOC clicked");
        var toc = [];

        var isPrevLineHeading = false;
        var lastLineNo = editor.lastLine();
        for (var i = lastLineNo; i >=0; i--) {
            var line = editor.getLine(i);
            //console.log(i, line);
            var tocid = "toc-" + i;
            var foundBookmark = line.match(/<a name=(.*)><\/a>/);
            if (isPrevLineHeading) {
                var tocEntry;
                var newLineText;
                if (foundBookmark) {
                    newLineText =  line.replace(foundBookmark[0], "<a name='" + tocid  + "'></a>");
                    editor.replaceRange(newLineText, {line: i, ch: 0}, {line: i, ch: line.length});
                    tocEntry = getTOCEntry(getHeadingText(editor.getLine(i+1)), tocid, getHeadingLevel(editor.getLine(i+1)));
                } else {
                    newLineText =  "\n<a name='" + tocid + "'></a>";
                    editor.replaceRange(newLineText, {line: i, ch: line.length}, {line: i, ch: line.length});
                    tocEntry = getTOCEntry(getHeadingText(editor.getLine(i+2)), tocid, getHeadingLevel(editor.getLine(i+2)));
                }


                toc.unshift(tocEntry);

            }

            isPrevLineHeading = isHeadingLine(line);

        }
        textarea.setAttribute("style", "display:original");
        textarea.value=toc.join("\n");
        textarea.select();
        document.execCommand("Copy");
        textarea.setAttribute("style", "display:none");
    });


    function getTOCEntry(text, id, level) {
        var spaces = "";

        for (var i = 0; i < level; i++) {
            spaces += " ";
        }
        return spaces + "1. [" + text + "](#"+id+")";
    }

    function getHeadingText(line) {
        line = line.trim();
        for (var i = 0; i < line.length; i++) {
            if (line.charAt(i) !== '#') {
                return line.substr(i).trim();
            }
        }
        return line.text;
    }
    function getHeadingLevel(line) {
        line = line.trim();
        for (var i = 0; i < line.length; i++) {
            if (line.charAt(i) !== '#') {
                return i-1;
            }
        }
        return -1;
    }

    function isHeadingLine(line) {
        if (!line ) return false;
        return line.indexOf("#") === 0;
    }

})();