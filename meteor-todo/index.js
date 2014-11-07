var Tasks = new Meteor.Collection("tasks");
var always = function () {
	return true;
};
Tasks.allow({
	insert: always,
	update: always,
	remove: always
});

if (Meteor.isClient) {

	Meteor.subscribe("tasks");

	Template.TaskForm.events({
		"keydown input": function (e) {
			if (e.keyCode !== 13) {
				return;
			}
			Tasks.insert({
				description: e.target.value,
				done: false
			});
			e.target.value = "";
		}
	});

	Template.TasksList.helpers({
		tasks: function () {
			return Tasks.find();
		}
	});

	Template.TaskSummary.helpers({
		checkboxClass: function () {
			return Template.instance().data.done ? "fa-check-square-o" : "fa-square-o";
		}
	});

	Template.TaskSummary.events({
		"click .remove": function () {
			var task = Template.instance().data;
			Tasks.remove(task._id);
		},
		"click .toggle": function () {
			var task = Template.instance().data;
			Tasks.update(task._id, {
				$set: {
					done: !task.done
				}
			});
		}
	});

}

if (Meteor.isServer) {

	Meteor.publish("tasks", function () {
		return Tasks.find();
	});

}
