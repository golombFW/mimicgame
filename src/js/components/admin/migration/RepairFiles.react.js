var Parse = require('parse').Parse;
var React = require('react');
var _ = require('underscore');
var blobUtil = require('blob-util');

var RepairFiles = React.createClass({
    filenames: [],
    getInitialState: function () {
        return {
            filesToMigrate: ""
        }
    },
    render: function () {
        var errors = _.map(this.filenames, function (error) {
            return (<li>{error}</li>);
        });
        return (
            <div>
                <label>Wybierz pliki: </label>
                <input id="image-file" type="file"
                       multiple
                       onChange={this.handleChange}/>
                <input className="btn btn-default" type="submit" value="Wyślij" onClick={this.uploadImages}/>
                <br/>
                <ul>
                    {errors}
                </ul>
            </div>
        );
    },
    handleChange: function (event) {
        console.log("handleChange");
        if (event.target.files) {
            this.setState({filesToMigrate: event.target.files})
        }
    },
    uploadImages: function () {
        var files = this.state.filesToMigrate;
        Parse.Cloud.run('migrationGetPhotos').then(function (photoQuestions) {
            _.each(files, function (file) {
                var oldPhoto = _.find(photoQuestions, function (photoQuestion) {
                    return photoQuestion.photo._name == file.name;
                });
                if (oldPhoto) {
                    blobUtil.blobToBase64String(file).then(function (base64String) {
                        var fileNameRegex = /[a-zA-Z0-9]+_{1}[a-zA-Z0-9]+$/;
                        var fileName = file.name.match(fileNameRegex);
                        if (fileName && fileName instanceof Array && 0 < fileName.length) {
                            fileName = fileName[0];
                        }

                        return Parse.Cloud.run('migrationUpdatePhoto', {
                            photoId: oldPhoto.id,
                            newPhoto: base64String,
                            fileName: fileName
                        })
                    }).then(function (result) {
                        console.log(result);
                    }, function (error) {
                        this.filenames.push(error);
                        console.error(error);
                    }.bind(this));
                }
            });
        });
    }
});

module.exports = RepairFiles;