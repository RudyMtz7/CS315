/**********************************************************************
 *  README.txt
 *  CS315 - Matrix transformations
 **********************************************************************/

/**********************************************************************
 * What is your name?
 ***********************************************************************/

Jahrme Risner

/**********************************************************************
 * What browser and operating system did you test your program with?
 ***********************************************************************/

Operating System:
	- macOS Sierra Version 10.12.6 (16G29)

Browsers:
    - Chrome Version 60.0.3112.113 (Official Build) (64-bit)

/**********************************************************************
 * Answer any questions here that you were asked to answer on the
 * assignment's web page.
 ***********************************************************************/

Exercise 1: Combining Matrix Transformations

    The order of matrix multiplication *is* significant.
    When we translate first, the multiplication maintains the translation
    solely in the fourth column of the transformation matrix (as we desire).
    In the case of rotation and then translation, because the translation
    takes a linear combination of of the first three columns, and thus results
    in corrupted translation values (e.g., if we were translating along the
    axes by a, b, and c (corresponding to the x, y, and z axes), and rotating
    around the axes by x, y, and z; instead of a translation by a, we would
    have a translation of a*cos(y)*cos(z) - b*cos(y)*sin(z) + c*sin(y).).

Exercise 3: Mirror Transforms

    When the material is not declared as Double Sided, the material will
    be be visible from only one side. The result is that you do not see
    the side of the knight closest to you, instead you see the opposite
    interior side.

    Another solution to this problem would be to invert the orientation
    of the knight (i.e., to make the "inside" the "outside" and vice
    versa). This would then make the knight invisible from the inside,
    but the knight would appear completely normal from the exterior.

/**********************************************************************
 * Approximately how many hours did you spend working on this assignment?
 ***********************************************************************/

2.5

/**********************************************************************
 * Describe any problems you encountered in this assignment.
 **********************************************************************/

The instructions for the "multi axis transform" in the "mirror transforms"
section were not clear as to what transformation was being done. Once I
got clarification there was no issue completing the task.

In addition, during the "Skew Shear" portion it was not obvious that the
transformations needed to halve the inputs (a, b, and c) in order to
recreate the same transformations shown in the video.

/**********************************************************************
 * If you did any extra credit on this assignment, include relevant
 * links and comments below.
 **********************************************************************/

N/A
